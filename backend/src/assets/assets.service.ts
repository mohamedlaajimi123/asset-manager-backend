import { Injectable, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { BlobServiceClient, StorageSharedKeyCredential, generateBlobSASQueryParameters, BlobSASPermissions, SASProtocol } from '@azure/storage-blob';
import { ConfigService } from '@nestjs/config';
import type { Express } from 'express';
import { PrismaService } from '../prisma.service';
import { EmailClient } from '@azure/communication-email';
import { canAcceptUpload, getStorageUsagePercent } from './storage-usage';

@Injectable()
export class AssetsService {
  private readonly blobServiceClient: BlobServiceClient;
  private readonly containerName: string;
  private readonly emailClient?: EmailClient;

  constructor(
    private readonly prisma: PrismaService, 
    private readonly configService: ConfigService,
  ) {
    const connectionString = this.configService.getOrThrow<string>('azure.storageConnectionString');
    const containerName = this.configService.getOrThrow<string>('azure.containerName');

    this.containerName = containerName;
    this.blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);

    if (process.env.NODE_ENV === 'production') {
      const emailConnectionString = this.configService.getOrThrow<string>('azure.emailConnectionString');
      this.emailClient = new EmailClient(emailConnectionString);
    }
  }

  private getBlobClient(blobName: string) {
    return this.blobServiceClient.getContainerClient(this.containerName).getBlockBlobClient(blobName);
  }

  private formatBytes(bytes: number) {
    if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let value = bytes;
    let unitIndex = 0;
    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024;
      unitIndex += 1;
    }
    return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
  }

  private async getOrCreateDefaultFolder(userId: string) {
    let folder = await this.prisma.folder.findFirst({
      where: { userId },
    });

    if (!folder) {
      try {
        folder = await this.prisma.folder.create({
          data: { 
            userId, 
            name: 'Root' 
          },
        });
      } catch (error) {
        folder = await this.prisma.folder.findFirst({
          where: { userId },
        });
        
        if (!folder) throw error;
      }
    }
    
    return folder;
  }

  async createFolder(name: string, userId: string) {
    if (!name || name.trim() === '') {
      throw new BadRequestException('Folder name cannot be empty');
    }
    return this.prisma.folder.create({
      data: {
        name: name.trim(),
        userId,
      },
    });
  }

  async createAsset(file: Express.Multer.File, userId: string, folderId?: string) {
    let targetFolderId = folderId;

    // 1. Structural DB Validation Checks (Fast)
    if (targetFolderId) {
      const customFolder = await this.prisma.folder.findUnique({ where: { id: targetFolderId } });
      if (!customFolder || customFolder.userId !== userId) {
        throw new UnauthorizedException('Invalid destination folder');
      }
    } else {
      const defaultFolder = await this.getOrCreateDefaultFolder(userId);
      targetFolderId = defaultFolder.id;
    }

    const userProfile = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { storageLimit: true, storageUsed: true },
    });

    if (!userProfile) {
      throw new NotFoundException('User profile not found');
    }

    const storageLimit = Number(userProfile.storageLimit);
    const storageUsed = Number(userProfile.storageUsed);
    if (!canAcceptUpload({ storageUsed, storageLimit, incomingBytes: file.size })) {
      const remaining = Math.max(0, storageLimit - storageUsed);
      throw new BadRequestException(`Storage limit reached. You have ${this.formatBytes(remaining)} remaining.`);
    }

    // 2. Format names and dispatch binary data immediately to Azure Blob Storage
    const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const blobName = `${userId}/${Date.now()}-${sanitizedFilename}`;
    const blobClient = this.getBlobClient(blobName);

    await blobClient.uploadData(file.buffer, {
      blobHTTPHeaders: { blobContentType: file.mimetype },
    });

    let newAsset;
    try {
      newAsset = await this.prisma.$transaction(async (tx) => {
        const createdAsset = await tx.asset.create({
          data: {
            filename: file.originalname,
            blobName,
            mimeType: file.mimetype,
            sizeInBytes: file.size,
            folderId: targetFolderId,
          },
        });

        await tx.user.update({
          where: { id: userId },
          data: {
            storageUsed: userProfile.storageUsed + BigInt(file.size),
          },
        });

        return createdAsset;
      });
    } catch (error) {
      try {
        await blobClient.deleteIfExists();
      } catch (cleanupError) {
        console.error('Failed to clean up uploaded blob after transaction failure:', cleanupError);
      }
      throw error;
    }

    // 3. SPEED BOOST FIX: Asynchronous Fire-and-Forget Email Dispatch
    if (process.env.NODE_ENV === 'production') {
      const senderAddress = this.configService.getOrThrow<string>('azure.emailFromAddress');
      if (senderAddress && this.emailClient) {
        const emailMessage = {
          senderAddress: senderAddress,
          content: {
            subject: 'Asset Uploaded Successfully',
            plainText: `Success: The file "${newAsset.filename}" has been processed and saved to your asset hub.`,
          },
          recipients: {
            to: [{ address: 'mohamedlaajimi2005@gmail.com' }],
          },
        };

        this.emailClient.beginSend(emailMessage)
          .then(async (poller) => {
            const result = await poller.pollUntilDone();
            console.log('Azure SDK Email status (Background):', result.status);
          })
          .catch((err) => {
            console.error('Non-blocking background email notification failed:', err);
          });
      } else {
        console.warn('EMAIL_FROM_ADDRESS undefined or Azure email client unavailable. Skipping notification cascade.');
      }
    } else {
      console.log('DEV MOCK EMAIL: Notification sent successfully to user');
    }

    return newAsset;
  }
  async listAssetsByUser(userId: string, role: string) {
    if (role === 'ADMIN') {
      return this.prisma.asset.findMany({
        orderBy: { createdAt: 'desc' },
      });
    }

    return this.prisma.asset.findMany({
      where: { folder: { userId } },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async getAssetAndVerifyOwner(assetId: string, userId: string, role: string) {
    const asset = await this.prisma.asset.findUnique({ 
      where: { id: assetId },
      include: { folder: true }
    });

    if (!asset) throw new NotFoundException('Asset not found');
    
    if (role !== 'ADMIN' && asset.folder.userId !== userId) {
      throw new UnauthorizedException('Access denied');
    }
    
    return asset;
  }

  async getAssetFile(assetId: string, userId: string, role: string) {
    const asset = await this.getAssetAndVerifyOwner(assetId, userId, role);
    const blobClient = this.getBlobClient(asset.blobName);
    const downloadResponse = await blobClient.download();
    const stream = downloadResponse.readableStreamBody;
    if (!stream) throw new NotFoundException('Unable to retrieve file stream');
    return { asset, stream };
  }

  async generateBlobSasUrl(assetId: string, userId: string, role: string) {
    const asset = await this.getAssetAndVerifyOwner(assetId, userId, role);
    const connectionString = this.configService.getOrThrow<string>('azure.storageConnectionString');
    
    const parsed = new URL(this.blobServiceClient.url);
    const accountName = parsed.hostname.split('.')[0];
    const sharedKeyCredential = new StorageSharedKeyCredential(
      accountName,
      this.extractAccountKeyFromConnectionString(connectionString),
    );

    const sasToken = generateBlobSASQueryParameters(
      {
        containerName: this.containerName,
        blobName: asset.blobName,
        permissions: BlobSASPermissions.parse('r'),
        startsOn: new Date(),
        expiresOn: new Date(Date.now() + 60 * 60 * 1000),
        protocol: SASProtocol.Https,
      },
      sharedKeyCredential,
    ).toString();

    return `${this.getBlobClient(asset.blobName).url}?${sasToken}`;
  }

  private extractAccountKeyFromConnectionString(connectionString: string): string {
    const match = connectionString.match(/AccountKey=([^;]+)/);
    if (!match) throw new Error('AZURE_STORAGE_CONNECTION_STRING must contain AccountKey');
    return match[1];
  }

  async getStorageUsage(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { storageLimit: true, storageUsed: true },
    });

    if (!user) {
      throw new NotFoundException('User profile not found');
    }

    const storageLimit = Number(user.storageLimit);
    const storageUsed = Number(user.storageUsed);
    return {
      storageLimit,
      storageUsed,
      remaining: Math.max(0, storageLimit - storageUsed),
      percentUsed: getStorageUsagePercent(storageUsed, storageLimit),
    };
  }

  async deleteAsset(assetId: string, userId: string, role: string) {
    const asset = await this.getAssetAndVerifyOwner(assetId, userId, role);
    const blobClient = this.getBlobClient(asset.blobName);
    await blobClient.deleteIfExists();

    await this.prisma.$transaction(async (tx) => {
      const owner = await tx.user.findUnique({
        where: { id: asset.folder.userId },
        select: { storageUsed: true },
      });

      if (owner) {
        const currentUsed = Number(owner.storageUsed);
        const nextUsed = Math.max(0, currentUsed - asset.sizeInBytes);
        await tx.user.update({
          where: { id: asset.folder.userId },
          data: { storageUsed: BigInt(nextUsed) },
        });
      }

      await tx.asset.delete({ where: { id: asset.id } });
    });

    return { deleted: true };
  }
  async listFoldersByUser(userId: string, role: string) {
    if (role === 'ADMIN') {
      const folders = await this.prisma.folder.findMany({
        include: {
          user: {
            select: { email: true, storageLimit: true, storageUsed: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return folders.map((folder) => ({
        ...folder,
        user: folder.user
          ? {
              email: folder.user.email,
              storageLimit: Number(folder.user.storageLimit),
              storageUsed: Number(folder.user.storageUsed),
            }
          : undefined,
      }));
    }

    return this.prisma.folder.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async adminForceDeleteAsset(assetId: string) {
    const asset = await this.prisma.asset.findUnique({
      where: { id: assetId },
      include: { folder: true },
    });

    if (!asset) {
      throw new NotFoundException(`Administrative purge failed. Asset with ID "${assetId}" does not exist.`);
    }

    try {
      const blobClient = this.getBlobClient(asset.blobName);
      await blobClient.deleteIfExists();
    } catch (cloudError) {
      console.error('Azure Blob Storage cleanup failure:', cloudError);
      throw new BadRequestException('Failed to purge physical file data from Azure containers');
    }

    await this.prisma.$transaction(async (tx) => {
      const owner = await tx.user.findUnique({
        where: { id: asset.folder.userId },
        select: { storageUsed: true },
      });

      if (owner) {
        const currentUsed = Number(owner.storageUsed);
        const nextUsed = Math.max(0, currentUsed - asset.sizeInBytes);
        await tx.user.update({
          where: { id: asset.folder.userId },
          data: { storageUsed: BigInt(nextUsed) },
        });
      }

      await tx.asset.delete({
        where: { id: assetId },
      });
    });

    return {
      purged: true,
      message: `Asset "${asset.filename}" successfully deleted via admin override.`,
    };
  }
    

}