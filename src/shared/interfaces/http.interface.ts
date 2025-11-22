export interface IHttpErrorResponse {
  success: boolean;
  code: number;
  message: string;
}

export interface IHttpSuccessResponse<T> {
  success: boolean;
  code: number;
  message: string;
  data: T | IPaginateInfo<T>;
}

export interface IPaginateInfo<T = any> {
  total: number;
  list: T[];
}

// Http response
export type IHttpResponse<T> = IHttpSuccessResponse<T> | IHttpErrorResponse;
