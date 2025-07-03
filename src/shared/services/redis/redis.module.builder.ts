import { ConfigurableModuleBuilder } from '@nestjs/common';
import { RedisOptions } from 'ioredis';

export const {
  ConfigurableModuleClass: RedisConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN: REDIS_MODULE_OPTIONS_TOKEN,
} = new ConfigurableModuleBuilder<RedisOptions>()
  .setFactoryMethodName('createRedisOptions')
  .build();
