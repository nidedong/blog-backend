import { IsNotEmpty } from 'class-validator';
import { getI18nPath } from 'shared/common';

export class CreateTestDto {
  @IsNotEmpty({
    message: getI18nPath('tip.api_param_property_not_empty'),
    context: {
      property: '姓名',
    },
  })
  name: string;
  @IsNotEmpty({ message: getI18nPath('tip.api_param_property_not_empty') })
  age: number;
}
