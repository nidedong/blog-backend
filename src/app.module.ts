/*
 * :file description:
 * :name: /blog-backend/src/app.module.ts
 * :author: dongbibo
 * :copyright: (c) 2025, Tungee
 * :date created: 2024-12-05 17:14:00
 * :last editor: dongbibo
 * :date last edited: 2025-07-03 11:12:47
 */
import { Module } from '@nestjs/common';
import { SharedModule } from 'shared/shared.module';
import { TestModule } from './test/test.module';
import { UserModule } from './user/user.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtAuthGuard } from 'shared/guards/jwt.auth.guard';
import { RefreshTokenInterceptor } from 'shared/interceptor/refresh.token.interceptor';

@Module({
  imports: [SharedModule, UserModule, TestModule],
  providers: [
    {
      // 刷新token
      provide: APP_INTERCEPTOR,
      useClass: RefreshTokenInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
