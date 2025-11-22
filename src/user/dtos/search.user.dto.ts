import { Optional } from '@nestjs/common';
import { BasePaginatedParamsDto } from 'shared/dtos/base.paginated.params.dto';

export class SearchUserParamsDto extends BasePaginatedParamsDto {
  @Optional()
  keyword?: string;
}
