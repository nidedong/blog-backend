// todo

import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisOptions } from 'ioredis';
import { EnvironmentVariable } from 'shared/interfaces';

export interface RedisModuleOptionsFactory {
  createRedisOptions(): Promise<RedisOptions> | RedisOptions;
}

@Injectable()
export class RedisConfigService implements RedisModuleOptionsFactory {
  @Inject(ConfigService)
  configService: ConfigService<EnvironmentVariable>;

  createRedisOptions(): Promise<RedisOptions> | RedisOptions {
    const envRedisConfig = this.configService.get('redis', { infer: true });

    return {
      host: envRedisConfig.host,
      port: envRedisConfig.port,
      username: envRedisConfig.username,
      password: envRedisConfig.password,
      db: envRedisConfig.db,
      keyPrefix: envRedisConfig.keyPrefix
        ? `${envRedisConfig.keyPrefix}:`
        : undefined,
    };
  }
}
