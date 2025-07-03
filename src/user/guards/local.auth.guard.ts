import { ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthGuard } from '@nestjs/passport';
import { StrategyEnum } from 'shared/enums';
import { Request } from 'express';

@Injectable()
export class LocalAuthGuard extends AuthGuard(StrategyEnum.Local) {
  constructor() {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // 如果邮箱密码都有则走strategy的验证，否则走validator验证参数并给提示

    const request = context.switchToHttp().getRequest<Request>();
    if (request.body.email && request.body.password) {
      return super.canActivate(context);
    }

    return true;
  }
}
