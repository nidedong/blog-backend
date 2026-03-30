import { IsNotEmpty } from 'class-validator';
import { getI18nPath } from 'shared/common';

export class CreateGroupConvDto {
  @IsNotEmpty({
    message: getI18nPath('tip.api_param_property_not_empty'),
  })
  title: string;

  avatar?: string;
  @IsNotEmpty({
    message: getI18nPath('tip.api_param_property_not_empty'),
  })
  userIds: string[];
}
