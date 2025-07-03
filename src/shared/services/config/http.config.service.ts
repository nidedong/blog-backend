import { HttpModuleOptions, HttpModuleOptionsFactory } from '@nestjs/axios';
import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariable } from 'shared/interfaces';

export class HttpConfigService implements HttpModuleOptionsFactory {
  @Inject(ConfigService)
  configService: ConfigService<EnvironmentVariable>;

  createHttpOptions(): HttpModuleOptions {
    const httpConfig = this.configService.get('http', { infer: true });
    return {
      baseURL: httpConfig.base_url,
      timeout: httpConfig.timeout,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    };
  }
}
