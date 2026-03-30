import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CreateMsgDto } from 'chat/dtos/message/create.msg.dto';
import { GetMsgListDto } from 'chat/dtos/message/get.msg.list.dto';
import { MessageService } from 'chat/services/message.service';
import { User } from 'shared/decorator';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post('send')
  sendMessage(@User('id') senderId: string, @Body() dto: CreateMsgDto) {
    return this.messageService.sendMessage(senderId, dto);
  }

  @Get('list')
  getList(@Query() dto: GetMsgListDto) {
    return this.messageService.getList(dto);
  }
}
