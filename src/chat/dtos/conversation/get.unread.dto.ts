import { IsArray, IsNotEmpty } from 'class-validator';
import { getI18nPath } from 'shared/common';

export class GetUnreadDto {
  @IsNotEmpty({
    message: getI18nPath('tip.api_param_property_not_empty'),
  })
  @IsArray()
  cids: string[];
}
