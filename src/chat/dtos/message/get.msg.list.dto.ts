import { Transform } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
import { getI18nPath } from 'shared/common';

export class GetMsgListDto {
  @IsNotEmpty({
    message: getI18nPath('tip.api_param_property_not_empty'),
  })
  conversationId: string;

  @IsNotEmpty({
    message: getI18nPath('tip.api_param_property_not_empty'),
  })
  @Transform((params) => +params.value)
  limit: number;

  beforeSeq?: number;

  afterSeq?: number;
}
