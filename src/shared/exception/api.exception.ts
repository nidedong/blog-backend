import { HttpException, HttpStatus } from '@nestjs/common';
import { ITipConfig, TipConfigs } from 'shared/common';
import { I18nPath } from 'generated/i18n.generated';

// 请求相关错误 客户端错误
export class ApiException extends HttpException {
  private readonly tip: ITipConfig;
  private readonly extra?: any;

  constructor(tipId: I18nPath, extra?: any) {
    const tip = TipConfigs[tipId] ?? {
      statusCode: HttpStatus.OK,
      code: HttpStatus.BAD_REQUEST,
      message: tipId,
      id: tipId,
    };
    super(tip.id, tip.statusCode);
    this.tip = tip;
    this.extra = extra;
  }

  public static tipError(tipId: I18nPath, extra?: Record<string, any>) {
    return new ApiException(tipId, extra);
  }

  getTip() {
    return this.tip;
  }

  getExtra() {
    return this.extra;
  }

  getMessage() {
    return this.message;
  }
}
