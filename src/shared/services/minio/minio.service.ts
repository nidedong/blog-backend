import { ConfigService } from '@nestjs/config';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Client, ClientOptions } from 'minio';
import { MINIO_MODULE_OPTIONS_TOKEN } from './minio.module.builder';
import { EnvironmentVariable } from 'shared/interfaces';
import { TimeInterval } from 'shared/common';

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly client: Client;

  private readonly bucketName: string;
  private readonly publicPrefix = 'public';

  private readonly logger = new Logger(MinioService.name);

  constructor(
    @Inject(MINIO_MODULE_OPTIONS_TOKEN) options: ClientOptions,
    private readonly configService: ConfigService<EnvironmentVariable>,
  ) {
    this.client = new Client(options);
    const { bucketName } = this.configService.get('minio', {
      infer: true,
    });
    this.bucketName = bucketName;
  }

  /** 初始化存储桶策略 */
  private async initializeBucketPolicies() {
    // const { address, port } = this.configService.get('app', { infer: true });

    // 公共策略
    const publicStatement = [
      {
        Effect: 'Allow',
        Principal: '*',
        Action: ['s3:GetObject'],
        Resource: [`arn:aws:s3:::${this.bucketName}/${this.publicPrefix}/*`],
      },
    ];

    // 私有策略(需通过与签名访问)
    const privateStatement = [
      {
        Effect: 'Deny',
        Principal: { AWS: ['*'] },
        Action: ['s3:*'],
        Resource: [`arn:aws:s3:::${this.bucketName}/users/*`],
      },
    ];

    // 系统文件策略
    // const systemStatement = [
    //   {
    //     Effect: 'Allow',
    //     Principal: '*',
    //     Action: ['s3:*'],
    //     Resource: [`arn:aws:s3:::${this.bucketName}/system/*`],
    //     Condition: {
    //       IpAddress: { 'aws:SourceIp': [`${address}/${port}`] },
    //     },
    //   },
    // ];

    const policy = {
      Version: '2012-10-17',
      Statement: [...publicStatement, ...privateStatement],
    };

    return this.client.setBucketPolicy(this.bucketName, JSON.stringify(policy));
  }

  async onModuleInit() {
    try {
      if (!this.bucketName) {
        this.logger.error('未配置minio bucketName!');
      }
      const bucketExist = await this.client.bucketExists(this.bucketName);
      if (!bucketExist) {
        this.logger.warn(
          `minio bucket【${this.bucketName}】不存在，准备创建...`,
        );
        await this.client.makeBucket(this.bucketName);
      }

      await this.initializeBucketPolicies();
    } catch (error) {
      this.logger.error(error);
    }
  }

  public getClient() {
    return this.client;
  }

  generateObjectPath(userId: string, file: Partial<File>) {
    const prefixMap = {
      'image/jpeg': `users/${userId}/imgs/`,
      'image/png': `users/${userId}/imgs/`,
      'image/gif': `users/${userId}/imgs/`,
      'image/webp': `users/${userId}/imgs/`,
      'application/pdf': `users/${userId}/documents/`,
      'application/msword': `users/${userId}/documents/`,
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': `users/${userId}/documents/`,
      'application/vnd.ms-excel': `users/${userId}/documents/`,
      'application/vnd.ms-powerpoint': `users/${userId}/documents/`,
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': `userss/${userId}/documents/`,
      'application/text/plain': `users/${userId}/documents/`,
      'application/text/csv': `users/${userId}/documents/`,
      default: `users/${userId}/others/`,
    };
    return `${prefixMap[file.type] ?? prefixMap.default}${Date.now()}.${file.name}`;
  }

  withPublicUrl = (objectName: string) => {
    return `${this.publicPrefix}${objectName.startsWith('/') ? objectName : '/' + objectName}`;
  };

  /** 资源公共访问地址 */
  fillUrl = (objectName: string) => {
    const { bucketName, endPoint, port, useSSL } = this.configService.get(
      'minio',
      {
        infer: true,
      },
    );

    const protocol = useSSL ? 'https' : 'http';
    return `${protocol}://${endPoint}:${port}/${bucketName}/${objectName}`;
  };

  async presignedPutObject(
    objectName: string,
    // 15分钟有效期
    expires: number = 15 * 60,
  ) {
    const uploadUrl = await this.client.presignedPutObject(
      this.bucketName,
      objectName,
      expires,
    );

    return {
      bucketName: this.bucketName,
      uploadUrl,
    };
  }

  async presignedGetObject(
    objectName: string,
    // 七天分钟有效期
    expires: number = TimeInterval.SevenDays,
  ) {
    const downloadUrl = await this.client.presignedGetObject(
      this.bucketName,
      objectName,
      expires,
    );

    return downloadUrl;
  }
}
