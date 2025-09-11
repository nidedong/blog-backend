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
}

export enum TimeInterval {
  SevenDays = 604800,
}
