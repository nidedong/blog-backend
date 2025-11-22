import { ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { ENABLE_VISIT_NOT_LOGIN } from 'shared/common';
import { StrategyEnum } from 'shared/enums';
import { CommonException, ServerException } from 'shared/exception';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtAuthGuard extends AuthGuard(StrategyEnum.Jwt) {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      ENABLE_VISIT_NOT_LOGIN,
      [context.getHandler(), context.getClass()],
    );

    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }

  getRequest(context: ExecutionContext) {
    const client = context.switchToWs().getClient<Socket>();
    const token = client.handshake?.auth?.token;
    console.log('🚀 ~ WsJwtAuthGuard ~ getRequest ~ token:', token);

    if (!token) {
      throw new ServerException(
        CommonException.UNAUTHORIZED,
        HttpStatus.UNAUTHORIZED,
      );
    }

    // 手动模拟一个 http request 对象给 passport
    return {
      headers: {
        authorization: `Bearer ${token}`,
      },
    };
  }

  handleRequest<TUser = any>(
    err: any,
    user: TUser | undefined,
    _: any,
    context: ExecutionContext,
  ): TUser {
    const client = context.switchToWs().getClient<Socket>();
    if (err || !user) {
      throw new ServerException(
        CommonException.UNAUTHORIZED,
        HttpStatus.UNAUTHORIZED,
      );
    }
    // 验证通过后，把 user 挂载到 socket.data 上
    client.data.user = user;
    return user;
  }
}
