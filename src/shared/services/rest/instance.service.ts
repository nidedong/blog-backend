import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { EnvironmentVariable } from 'shared/interfaces';

@Injectable()
export class InstanceService {
  readonly id: string;

  constructor(private configService: ConfigService<EnvironmentVariable>) {
    const instanceId = this.configService.get('app', {
      infer: true,
    }).instanceId;
    this.id = instanceId || `${process.pid}-${randomUUID()}`;
  }
}
