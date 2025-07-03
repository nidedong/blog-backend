import type { RegisterType } from 'shared/interfaces';

export interface JwtUserData {
  id: string;
  registerType: RegisterType;
  lastLoginTime: Date;
  refreshToken?: string;
  /**
   * token创建时间，过期时会有该字段
   */
  iat?: number;
  /**
   * token过期时间，过期时会有该字段
   */
  exp?: number;
}

declare module 'express' {
  interface Request {
    user?: JwtUserData;
  }
}
