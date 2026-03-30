import { IsNotEmpty, IsOptional } from 'class-validator';
import { getI18nPath } from 'shared/common';

export class CreateFriendReqDto {
  @IsNotEmpty({
    message: getI18nPath('tip.api_param_property_not_empty'),
  })
  receiverId: string;

  @IsOptional()
  message?: string;
}
