import { NotificationPushService } from './../../socket/services/notification.push.service';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotifySocketEvents, EventNames } from 'shared/enums';

@Injectable()
export class FriendRequestListener {
  constructor(
    private readonly notificationPushService: NotificationPushService,
  ) {}

  @OnEvent(EventNames.FRIEND_REQUEST)
  async handleFriendRequest({
    userId,
    count,
  }: {
    userId: string;
    count: number;
  }) {
    this.notificationPushService.notifyUser(
      userId,
      NotifySocketEvents.FRIEND_REQUEST,
      { count },
    );
  }
}
