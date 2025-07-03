import { Module } from '@nestjs/common';
import { MinioConfigurableModuleClass } from './minio.module.builder';
import { MinioService } from './minio.service';

@Module({
  providers: [MinioService],
  exports: [MinioService],
})
export class MinioModule extends MinioConfigurableModuleClass {}
