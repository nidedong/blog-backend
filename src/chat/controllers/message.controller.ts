import { Controller, Get, Query } from '@nestjs/common';
import { GetConversationListDto } from 'chat/dtos/get.conversation.list.dto';
import { MessageService } from 'chat/services/message.service';
import { User } from 'shared/decorator';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get('/list')
  getList(@User('id') userId: string, @Query() filter: GetConversationListDto) {
    return this.messageService.getList(userId, filter);
  }
}
