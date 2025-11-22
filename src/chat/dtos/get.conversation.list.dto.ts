import { Optional } from '@nestjs/common';
import { BasePaginatedParamsDto } from 'shared/dtos/base.paginated.params.dto';

export class GetConversationListDto extends BasePaginatedParamsDto {
  @Optional()
  keywrod?: string;
}
