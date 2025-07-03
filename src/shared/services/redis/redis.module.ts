import { Module } from '@nestjs/common';
import { RedisConfigurableModuleClass } from './redis.module.builder';
import { RedisService } from './redis.service';

@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule extends RedisConfigurableModuleClass {}
