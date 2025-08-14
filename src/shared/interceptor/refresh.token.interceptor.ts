import { UserService } from './../../user/services/user.service';
import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as dayjs from 'dayjs';
import { CommonException, ServerException } from 'shared/exception';
import { omit } from 'lodash';
import { ENABLE_VISIT_NOT_LOGIN } from 'shared/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RefreshTokenInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly userService: UserService,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      ENABLE_VISIT_NOT_LOGIN,
      [context.getHandler(), context.getClass()],
    );

    if (isPublic) {
      return next.handle().pipe();
    }

    const request = context.switchToHttp().getRequest<Request>();

    const accessToken = request.headers.authorization.split(' ')?.[1];

    let user = request.user;
    console.log(
      '🚀 ~ RefreshTokenInterceptor ~ intercept ~ accessToken:',
      accessToken,
      user,
    );

    // token过期
    if (dayjs(user.exp * 1000).isBefore(dayjs())) {
      console.log('-----------------');
      user = await this.userService.refreshToken(
        omit(user, 'refreshToken', 'iat', 'exp'),
        accessToken,
      );
    }

    // redis上的token也过期
    if (!user) {
      throw new ServerException(
        CommonException.UNAUTHORIZED,
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (user.refreshToken) {
      const response = context.switchToHttp().getResponse<Response>();
      response.setHeader('refresh_token', user.refreshToken);
    }

    return next.handle().pipe();
  }
}
