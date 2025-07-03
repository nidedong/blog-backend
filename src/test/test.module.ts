import { Module } from '@nestjs/common';
import { TestService } from './test.service';
import { TestController } from './test.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestUserEntity } from './entities/test.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TestUserEntity])],
  controllers: [TestController],
  providers: [TestService],
})
export class TestModule {}
