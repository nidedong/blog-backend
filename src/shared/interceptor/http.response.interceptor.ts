import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
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
