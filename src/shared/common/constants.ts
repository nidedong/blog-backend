export enum DefaultStatusMessage {
  OK_MSG = 'SUCCESS',
  SERVER_ERROR_MSG = 'SERVER_ERROR',
}

export enum MinioBucketName {
  DEFAULT = 'blog-bucket',
}

export const ENABLE_VISIT_NOT_LOGIN = 'ENABLE_VISIT_NOT_LOGIN';

export enum RedisPrefix {
  Token = 'token',
  LoginCaptcha = 'login_captcha',
  RegisterCaptcha = 'register_captcha',
  ChangePasswordCaptcha = 'change_password_captcha',
  ForgetPasswordCaptcha = 'forget_password_captcha',
}

export enum TimeInterval {
  SevenDays = 604800,
}

export class GatewayConstants {
  public static readonly SOCKET_PORT: number = parseInt(
    process.env.GATEWAY_PORT || '4002',
    10,
  );
  public static readonly NOTIFICATION_NAMESPACE: string = '/notification';
  public static readonly CHAT_NAMESPACE: string = '/chat';
}
