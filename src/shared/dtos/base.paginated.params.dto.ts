import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { getI18nPath } from 'shared/common';
import { SorterEnum } from 'shared/interfaces';

export class BasePaginatedParamsDto {
  @IsNotEmpty({
    message: getI18nPath('tip.api_param_property_not_empty'),
    context: {
      property: 'start',
    },
  })
  @ApiProperty({
    type: Number,
    description: '分页起始索引',
  })
  @Transform((params) => {
    return +params.value;
  })
  start: number;

  @IsNotEmpty({
    message: getI18nPath('tip.api_param_property_not_empty'),
    context: {
      property: 'end',
    },
  })
  @ApiProperty({
    type: Number,
    description: '分页结束索引',
  })
  @Transform((params) => {
    return +params.value;
  })
  end: number;

  @IsOptional()
  @Transform((params) => {
    return +params.value;
  })
  @IsEnum(SorterEnum)
  @ApiProperty({
    enum: SorterEnum,
    description: '根据创建时间排序 1升序 -1降序',
    required: false,
    default: SorterEnum.DESC,
  })
  order?: SorterEnum = SorterEnum.DESC;
}
