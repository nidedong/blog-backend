import { Inject, Injectable } from '@nestjs/common';
import { Client, ClientOptions } from 'minio';
import { MINIO_MODULE_OPTIONS_TOKEN } from './minio.module.builder';

@Injectable()
export class MinioService {
  private readonly client: Client;

  constructor(@Inject(MINIO_MODULE_OPTIONS_TOKEN) options: ClientOptions) {
    this.client = new Client(options);
  }

  public getClient() {
    return this.client;
  }
}
