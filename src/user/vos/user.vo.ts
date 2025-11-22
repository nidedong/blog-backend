import { Expose } from 'class-transformer';

export class UserVo {
  @Expose()
  id: string;

  @Expose()
  nickName?: string;

  @Expose()
  mobilePhone?: string;

  @Expose()
  email?: string;

  @Expose()
  avatar?: string;

  @Expose()
  gender?: number;

  @Expose()
  remark?: string;

  @Expose()
  lastLoginTime?: Date;

  @Expose()
  locale?: string;

  @Expose()
  isOnline?: boolean;
}
