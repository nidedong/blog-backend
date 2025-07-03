import { HttpStatus } from '@nestjs/common';
import { IBaseException } from './base.exception';

export class CommonException implements IBaseException {
  private static allValues: Record<string, CommonException> = {};

  public static UNAUTHORIZED = new CommonException(
    HttpStatus.UNAUTHORIZED,
    'unauthorized',
  );

  public static SERVER_ERROR = new CommonException(
    HttpStatus.INTERNAL_SERVER_ERROR,
    'server error',
  );

  constructor(
    private readonly code: number,
    private readonly message: string,
  ) {
    CommonException.allValues[message] = this;
  }

  getCode(): number {
    return this.code;
  }

  getMessage(): string {
    return this.message;
  }
}
