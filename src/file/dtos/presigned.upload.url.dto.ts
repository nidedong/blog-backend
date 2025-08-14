// ['eq', '$x-amz-meta-user', userId],

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { getI18nPath } from 'shared/common';
import { Boolean2Num } from 'shared/decorator';
import { BooleanType } from 'shared/interfaces';

export class PresignedUploadUrlDto {
  @ApiProperty({
    type: String,
    description: '上传文件名称',
  })
  @IsNotEmpty({
    message: getI18nPath('tip.api_param_property_not_empty'),
  })
  name: string;

  @ApiProperty({
    type: String,
    description: '上传文件类型',
  })
  @IsNotEmpty({
    message: getI18nPath('tip.api_param_property_not_empty'),
  })
  mimeType: string;

  @ApiProperty({
    type: Boolean,
    description: '是否为公共文件（其他人可以访问）',
  })
  @IsNotEmpty({
    message: getI18nPath('tip.api_param_property_not_empty'),
  })
  @Boolean2Num()
  isPublic?: BooleanType = BooleanType.FALSE;
}
