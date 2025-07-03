import { UserService } from './../../user/services/user.service';
import { ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { ENABLE_VISIT_NOT_LOGIN } from 'shared/common';
import { StrategyEnum } from 'shared/enums';
import { CommonException, ServerException } from 'shared/exception';
import { JwtUserData } from 'typing';

@Injectable()
export class JwtAuthGuard extends AuthGuard(StrategyEnum.Jwt) {
  constructor(
    private readonly reflector: Reflector,
    private readonly userService: UserService,
  ) {
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

  handleRequest<TUser = JwtUserData>(_, user: TUser | undefined): TUser {
    if (!user) {
      throw new ServerException(
        CommonException.UNAUTHORIZED,
        HttpStatus.UNAUTHORIZED,
      );
    }

    return user;
  }
}
