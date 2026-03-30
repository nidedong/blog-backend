import { Transform } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
import { getI18nPath } from 'shared/common';
import { FriendReqStatus } from 'user/interfaces';

export class HandleFriendReqDto {
  @IsNotEmpty({
    message: getI18nPath('tip.api_param_property_not_empty'),
  })
  @Transform((params) => +params.value)
  status: FriendReqStatus;
}
