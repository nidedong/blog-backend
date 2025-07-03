import { HttpStatus } from '@nestjs/common';
import { IBaseException } from './base.exception';

// 服务端相关错误
export class ServerException extends Error {
  private readonly code: number;

  private readonly statusCode: number;

  constructor(baseException: IBaseException, statusCode?: number) {
    super(baseException.getMessage());
    this.code = baseException.getCode();
    this.statusCode = statusCode ?? HttpStatus.OK;
  }

  getCode(): number {
    return this.code;
  }

  getMessage(): string {
    return this.message;
  }

  getStatusCode(): number {
    return this.statusCode;
  }
}
