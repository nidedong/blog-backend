import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { CreateGroupConvDto } from 'chat/dtos/conversation/create.group.conv.dto';
import { GetUnreadDto } from 'chat/dtos/conversation/get.unread.dto';
import { ConversationService } from 'chat/services/conversation.service';
import { MessageUnreadService } from 'chat/services/message.unread.service';
import { ConversationVo } from 'chat/vos/conversation.vo';
import { User, VoResponse } from 'shared/decorator';
import { ServiceNameEnum } from 'shared/enums';

@Controller('conversation')
export class ConversationController {
  constructor(
    private readonly conversationService: ConversationService,
    @Inject(ServiceNameEnum.MessageUnreadService)
    private readonly msgUnreadService: MessageUnreadService,
  ) {}

  @Get('/list')
  @VoResponse(ConversationVo)
  getList(@User('id') userId: string) {
    return this.conversationService.getList(userId);
  }

  @Post('/create/group')
  createGroupConv(@Body() dto: CreateGroupConvDto) {
    return this.conversationService.createGroupChat(dto);
  }

  @Get('unread_count')
  getUnreadCount(@User('id') userId: string, @Body() dto: GetUnreadDto) {
    return this.msgUnreadService.getUnreadCount(userId, dto.cids);
  }
}
