import { IHttpErrorResponse } from './../interfaces/http.interface';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Inject,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { head, keys } from 'lodash';
import { I18nService, I18nValidationException } from 'nestjs-i18n';
import { DefaultStatusMessage, getI18nPath } from 'shared/common';
import { ApiException, ServerException } from 'shared/exception';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  @Inject(I18nService)
  private readonly i18n: I18nService;

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    // const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    // 除去服务端自定义错误，其他未知错误都需要向监控平台报错
    if (
      !(exception instanceof ServerException) &&
      !(exception instanceof ApiException)
    ) {
      // todo 可向错误监控平台进行报错 sentry
    }

    let code = exception?.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR;
    let statusCode = exception?.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR;
    let message = exception.message ?? DefaultStatusMessage.SERVER_ERROR_MSG;

    // server exception
    if (exception instanceof ServerException) {
      code = exception.getCode();
      statusCode = exception.getStatusCode();
      message = exception.getMessage();
    }

    // 404
    if (exception instanceof NotFoundException) {
      code = exception?.getStatus() ?? HttpStatus.INTERNAL_SERVER_ERROR;
      statusCode = exception?.getStatus() ?? HttpStatus.INTERNAL_SERVER_ERROR;
      message = this.i18n.t(getI18nPath('tip.api_not_exist'));
    }

    // class-validate
    if (exception instanceof I18nValidationException) {
      // 只返回第一个错误
      const firstError = head(exception.errors);
      const firstKey = head(keys(firstError.constraints));
      const firstTip = firstError.constraints?.[firstKey];

      if (firstTip) {
        // todo 可调整为根据使用者所在位置切换对应的语言
        message = this.i18n.t(firstTip, {
          args: {
            property: firstError.property,
            ...firstError.contexts?.[firstKey],
          },
        });
      } else {
        message = this.i18n.t(
          getI18nPath('tip.api_validate_exception_not_legal'),
        );
      }

      statusCode = HttpStatus.OK;
      code = exception.getStatus();
    }

    // api exception
    if (exception instanceof ApiException) {
      code = exception.getTip().code;
      statusCode = exception.getTip().statusCode;
      message = this.i18n.t(exception.getTip().message, {
        args: exception.getExtra(),
      });
    }

    const errorResponse: IHttpErrorResponse = {
      code,
      message,
      success: false,
    };

    this.logger.error(exception);

    response.status(statusCode).json(errorResponse);
  }
}
