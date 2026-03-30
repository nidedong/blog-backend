import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
import { getI18nPath } from 'shared/common';

export class CreateUserDto {
  @IsOptional()
  @ApiProperty({
    description: '昵称',
    required: false,
  })
  nickName?: string;

  @IsOptional()
  @ApiProperty({
    description: '手机',
    required: false,
  })
  mobilePhone?: string;

  @IsNotEmpty({
    message: getI18nPath('tip.api_param_property_not_empty'),
  })
  @IsEmail(
    {},
    {
      message: getI18nPath('tip.api_email_format_not_correct'),
    },
  )
  @ApiProperty({
    description: '邮箱',
  })
  email: string;

  @IsNotEmpty({
    message: getI18nPath('tip.api_param_property_not_empty'),
  })
  @ApiProperty({
    description: '密码',
  })
  password: string;

  @IsOptional()
  @ApiProperty({
    description: '头像',
    required: false,
  })
  avatar?: string;

  @IsOptional()
  @ApiProperty({
    description: '性别',
    type: 'integer',
    enum: [0, 1],
  })
  gender: 0 | 1;

  @IsOptional()
  @ApiProperty({
    description: '备注',
    required: false,
  })
  remark?: string;

  @IsOptional()
  @ApiProperty({
    description: '语言',
    required: false,
  })
  locale?: string;

  @IsNotEmpty({
    message: getI18nPath('tip.api_param_property_not_empty'),
  })
  @ApiProperty({
    description: '邮箱验证码',
  })
  captcha: string;
}
