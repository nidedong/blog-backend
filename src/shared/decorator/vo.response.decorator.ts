import { UseInterceptors, applyDecorators } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable, map } from 'rxjs';

export function VoResponse(VoClass: any) {
  class VoInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      return next.handle().pipe(
        map((data) => {
          return plainToInstance(VoClass, data, {
            excludeExtraneousValues: true,
          });
        }),
      );
    }
  }

  return applyDecorators(
    // UseInterceptors(ClassSerializerInterceptor),
    UseInterceptors(VoInterceptor),
  );
}
