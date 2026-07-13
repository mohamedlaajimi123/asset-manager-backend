import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AssetsModule } from './assets/assets.module';
import { MailerModule } from "@nestjs-modules/mailer";
import azureEnvConfig from './config/azure-env.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [azureEnvConfig],
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('SMTP_HOST'),
          port: configService.get<number>('SMTP_PORT'),
          secure: false, 
          auth: {
            user: configService.get<string>('SMTP_USER'),
            pass: configService.get<string>('SMTP_PASS'), 
          },
        },
        defaults: { 
          from: configService.get<string>('EMAIL_FROM_ADDRESS') 
        },
      }),
      inject: [ConfigService], 
    }),

    AuthModule, 
    AssetsModule, 
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}