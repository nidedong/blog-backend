import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { map } from 'rxjs';
import { DefaultStatusMessage } from 'shared/common';
import { IHttpSuccessResponse } from 'shared/interfaces';

@Injectable()
export class HttpResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      map((data: any) => {
        if (data?.response instanceof Buffer) {
          return data.response;
        }

        const response = context.switchToHttp().getResponse<Response>();

        // 不要缓存接口
        response.setHeaders(
          new Headers({
            'Cache-Control':
              'no-store, no-cache, must-revalidate, proxy-revalidate',
            Pragma: 'no-cache',
            Expires: '0',
          }),
        );

        if (data?.code) {
          return data;
        }
        return {
          success: true,
          code: HttpStatus.OK,
          message: DefaultStatusMessage.OK_MSG,
          data,
        } as IHttpSuccessResponse<any>;
      }),
    );
  }
}
