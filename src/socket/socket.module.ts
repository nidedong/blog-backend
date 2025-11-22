import { Module } from '@nestjs/common';
import { NotificationGateway } from './gateways/notification.gateway';
import { ChatGateway } from './gateways/chat.gateway';

@Module({
  providers: [NotificationGateway, ChatGateway],
  exports: [NotificationGateway, ChatGateway],
})
export class SocketModule {}
