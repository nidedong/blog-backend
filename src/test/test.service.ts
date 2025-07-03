import { RedisService } from './../shared/services/redis/redis.service';
import { Inject, Injectable, Logger, Res } from '@nestjs/common';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';
import { I18nService } from 'nestjs-i18n';
import {
  ApiException,
  CommonException,
  ServerException,
} from 'shared/exception';
import { InjectLogger, MinioBucketName } from 'shared/common';
import { MinioService } from 'shared/services/minio/minio.service';
import { Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { TestUserEntity } from './entities/test.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TestService {
  @Inject(I18nService)
  i18n: I18nService;

  @InjectRepository(TestUserEntity)
  userRepository: Repository<TestUserEntity>;

  logger = new Logger(TestService.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly minioService: MinioService,
  ) {}

  async create(createTestDto: CreateTestDto) {
    this.logger.log(await this.redisService.lRange('list1', 0, -1));
    await this.redisService.set(RedisService.gk('name', 'age'), 'dongbibo');
    this.logger.log(await this.redisService.get('name'));

    return this.minioService
      .getClient()
      .getObject(MinioBucketName.DEFAULT, '排名成绩册(1).xls');

    console.log(await this.minioService.getClient().listBuckets());
    console.log(
      await this.minioService
        .getClient()
        .getObject(MinioBucketName.DEFAULT, '排名成绩册(1).xls'),
    );
    // throw ApiException.tipError('tip.api_param_property_not_empty', {
    //   property: '测试',
    // });
    // throw new ServerException(CommonException.UNAUTHORIZED);
    return createTestDto;
  }

  findAll() {
    return this.minioService
      .getClient()
      .getObject(MinioBucketName.DEFAULT, '排名成绩册(1).xls');
    // return `This action returns all test${this.i18n.t('test.hello')}`;
  }

  findOne(id: number) {
    return this.userRepository.find();
  }

  update(id: number, updateTestDto: UpdateTestDto) {
    return `This action updates a #${id} test`;
  }

  remove(id: number) {
    return `This action removes a #${id} test`;
  }
}
