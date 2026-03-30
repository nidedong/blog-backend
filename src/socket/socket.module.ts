import { Module } from '@nestjs/common';
import { NotificationGateway } from './gateways/notification.gateway';
import { ChatGateway } from './gateways/chat.gateway';
import { SocketUtilsService } from './services/socket.utils.service';
import { NotificationPushService } from './services/notification.push.service';
import { ChatPushService } from './services/chat.push.service';

@Module({
  providers: [
    NotificationGateway,
    ChatGateway,
    SocketUtilsService,
    NotificationPushService,
    ChatPushService,
  ],
  exports: [SocketUtilsService, NotificationPushService, ChatPushService],
})
export class SocketModule {}
