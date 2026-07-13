import { registerAs } from '@nestjs/config';

const LOCAL_DATABASE_URL =
  'postgresql://myuser:mypassword@localhost:5433/asset_management_db?schema=public';

export class AzureEnvConfig {
  constructor(
    public readonly databaseUrl: string,
    public readonly jwtSecret: string,
    public readonly containerName: string,
    public readonly storageConnectionString: string,
    public readonly emailConnectionString: string,
    public readonly emailFromAddress: string,
  ) {}
}

export default registerAs('azure', (): AzureEnvConfig => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const databaseUrl = isDevelopment
    ? LOCAL_DATABASE_URL
    : process.env.DATABASE_URL ?? process.env['DATABASE-URL'] ?? '';

  return new AzureEnvConfig(
    databaseUrl,
    process.env.JWT_SECRET ?? process.env['JWT-SECRET'] ?? '',
    process.env.AZURE_CONTAINER_NAME ?? process.env['AZURE-CONTAINER-NAME'] ?? '',
    process.env.AZURE_STORAGE_CONNECTION_STRING ?? process.env['AZURE-STORAGE-CONNECTION-STRING'] ?? '',
    process.env.AZURE_EMAIL_CONNECTION_STRING ?? process.env['AZURE-EMAIL-CONNECTION-STRING'] ?? '',
    process.env.EMAIL_FROM_ADDRESS ?? process.env['EMAIL-FROM-ADDRESS'] ?? '',
  );
});