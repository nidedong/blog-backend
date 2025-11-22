import { Body, Controller, Get, Post, Put, Query } from '@nestjs/common';
import { NotificationService } from '../services/notification.service';
import { User, VoResponse } from 'shared/decorator';
import {
  BroadCastMessageDto,
  GetNotifyListParamsDto,
  ReadNotificationParamsDto,
} from 'notify/dtos/notification.dto';
import { NotifyItemVo } from 'notify/vos/notification.vo';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('/list')
  @VoResponse(NotifyItemVo)
  getNotifyList(
    @User('id') userId: string,
    @Query() dto: GetNotifyListParamsDto,
  ) {
    return this.notificationService.getNotifyList(userId, dto);
  }

  @Put('/read')
  readNotification(
    @Body() dto: ReadNotificationParamsDto,
    @User('id') userId: string,
  ) {
    return this.notificationService.readNotification(userId, dto);
  }

  @Post('/broadcast')
  broadcastNotify(@Body() dto: BroadCastMessageDto) {
    return this.notificationService.broadcastNotify(dto);
  }
}
