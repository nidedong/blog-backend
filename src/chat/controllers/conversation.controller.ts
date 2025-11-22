import { Controller, Get, Query } from '@nestjs/common';
import { GetConversationListDto } from 'chat/dtos/get.conversation.list.dto';
import { ConversationService } from 'chat/services/conversation.service';
import { User } from 'shared/decorator';

@Controller('conversation')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Get('/list')
  getList(@User('id') userId: string, @Query() filter: GetConversationListDto) {
    return this.conversationService.getList(userId, filter);
  }
}
