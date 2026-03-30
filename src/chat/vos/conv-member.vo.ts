import { Expose, Transform } from 'class-transformer';

export class ConvMemberVo {
  @Expose()
  id: string;

  @Expose()
  @Transform(({ obj }) => obj.user?.nickName)
  nickName: string;

  @Expose()
  userId: string;

  @Transform(({ obj }) => obj.user?.avatar)
  @Expose()
  avatar: string;

  @Transform(({ obj }) => obj.user?.gender)
  @Expose()
  gender: number;

  @Transform(({ obj }) => obj.user?.string)
  @Expose()
  email: string;

  @Transform(({ obj }) => obj.user?.lastLoginTime)
  @Expose()
  lastLoginTime: Date;

  @Expose()
  conversationId: string;

  @Expose()
  joinedAt: string;
}
