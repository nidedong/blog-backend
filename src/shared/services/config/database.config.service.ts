import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { EnvironmentVariable } from 'shared/interfaces';
import { isDevMode } from 'app.environment';

@Injectable()
export class DatabaseConfigService implements TypeOrmOptionsFactory {
  @Inject(ConfigService)
  configService: ConfigService<EnvironmentVariable>;

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const {
      host,
      port,
      username,
      password,
      database,
      ssl,
      entityPrefix,
      connectionLimit,
      retryDelay,
    } = this.configService.get('mysql', { infer: true });

    return {
      type: 'mysql',
      host,
      port,
      username,
      password,
      database,
      ssl,
      entityPrefix,
      // don't change the below settings
      // entities: ['dist/**/*.entity{.ts,.js}'],
      autoLoadEntities: true,
      // use utf8mb4 to fix emoji storage issue
      charset: 'utf8mb4',
      // print SQL logs in dev mode only
      logging: isDevMode,
      connectTimeout: 60000,
      supportBigNumbers: true,
      bigNumberStrings: true,
      // don't change synchronize setting in prod
      synchronize: isDevMode,
      retryDelay,
      verboseRetryLog: true,
      connectorPackage: 'mysql2',
      extra: {
        connectionLimit,
      },
    };
  }
}
