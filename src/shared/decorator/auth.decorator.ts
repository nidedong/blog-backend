import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';
import { ENABLE_VISIT_NOT_LOGIN } from 'shared/common';
import { JwtUserData } from 'typing';

/**
 * 不需要登录就可以访问的接口
 */
export const IsPublic = () => SetMetadata(ENABLE_VISIT_NOT_LOGIN, true);

export const User = createParamDecorator(
  <K extends keyof JwtUserData>(data: K | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as JwtUserData;

    if (!user) {
      return null;
    }

    return data ? user[data] : user;
  },
);
