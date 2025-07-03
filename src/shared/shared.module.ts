/*
 * :file description:
 * :name: /blog-backend/src/shared/shared.module.ts
 * :author: dongbibo
 * :copyright: (c) 2025, Tungee
 * :date created: 2025-02-10 16:18:51
 * :last editor: dongbibo
 * :date last edited: 2025-07-03 11:17:48
 */
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { isDevMode } from 'app.environment';
import { WinstonModule } from 'nest-winston';
import { LoggerConfigService } from 'shared/services/config/logger.config.service';
import { resolve } from 'path';
import configuration from './configuration';
import { HttpModule } from '@nestjs/axios';
import { HttpConfigService } from './services/config/http.config.service';
import { I18nConfigModule } from './services/config/i18n.config.module';
import { GlobalExceptionFilter } from './filters/global.exception.filter';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { HttpResponseInterceptor } from './interceptor/http.response.interceptor';
import { RedisModule } from './services/redis/redis.module';
import { RedisConfigService } from './services/config/redis.config.service';
import { MinioModule } from './services/minio/minio.module';
import { EnvironmentVariable } from './interfaces';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConfigService } from './services/config/database.config.service';
import { MailModule } from './services/mail/mail.module';
import { MailConfigService } from './services/config/mail.config.service';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: isDevMode
        ? [
            resolve(__dirname, '../env/.env.defaults'),
            resolve(__dirname, '../env/.env.development'),
          ]
        : [
            resolve(__dirname, '../env/.env.defaults'),
            resolve(__dirname, '../env/.env.production'),
          ],
      load: [configuration],
    }),
    WinstonModule.forRootAsync({
      useClass: LoggerConfigService,
    }),
    HttpModule.registerAsync({
      useClass: HttpConfigService,
    }),
    I18nConfigModule,
    RedisModule.registerAsync({
      useClass: RedisConfigService,
    }),
    MinioModule.registerAsync({
      inject: [ConfigService],
      useFactory(configService: ConfigService<EnvironmentVariable>) {
        const minioConfig = configService.get('minio', { infer: true });
        return {
          ...minioConfig,
        };
      },
    }),
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfigService,
    }),
    MailModule.registerAsync({
      useClass: MailConfigService,
    }),
  ],
  providers: [
    {
      // 格式化响应信息
      provide: APP_INTERCEPTOR,
      useClass: HttpResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
  exports: [
    ConfigModule,
    HttpModule,
    WinstonModule,
    I18nConfigModule,
    RedisModule,
    MinioModule,
    MailModule,
  ],
})
export class SharedModule {}
