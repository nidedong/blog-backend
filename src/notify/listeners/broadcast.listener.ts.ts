import { NotificationPushService } from '../../socket/services/notification.push.service';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationBroadCastEntity } from 'notify/entities/notification_broadcast.entity';
import { EventNames } from 'shared/enums';

@Injectable()
export class BroadcastListener {
  constructor(
    private readonly notificationPushService: NotificationPushService,
  ) {}

  @OnEvent(EventNames.SYSTEM_BROADCAST)
  async handleBroadcast(notification: NotificationBroadCastEntity) {
    this.notificationPushService.broadcast(notification);
  }
}
