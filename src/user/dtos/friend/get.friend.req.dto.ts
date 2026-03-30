import { Optional } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { FriendReqStatus } from 'user/interfaces';

export class GetFriendReqDto {
  @Optional()
  @Transform((params) => +params.value)
  status?: FriendReqStatus;
}
