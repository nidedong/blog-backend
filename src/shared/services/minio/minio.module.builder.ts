import { ConfigurableModuleBuilder } from '@nestjs/common';
import { ClientOptions } from 'minio';

export const {
  ConfigurableModuleClass: MinioConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN: MINIO_MODULE_OPTIONS_TOKEN,
} = new ConfigurableModuleBuilder<Partial<ClientOptions>>().build();
