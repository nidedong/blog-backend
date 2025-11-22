import { UseInterceptors, applyDecorators } from '@nestjs/common';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { IPaginateInfo } from 'shared/interfaces';

export function VoPageResponse(VoClass: any) {
  class VoInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      return next.handle().pipe(
        map((data: IPaginateInfo) => {
          if (!data.list || !Array.isArray(data.list) || data.list.length === 0)
            return data;
          const instanceList = plainToInstance(VoClass, data.list, {
            excludeExtraneousValues: true,
          });
          return {
            ...data,
            list: instanceList,
          };
        }),
      );
    }
  }

  return applyDecorators(
    UseInterceptors(ClassSerializerInterceptor),
    UseInterceptors(VoInterceptor),
  );
}
