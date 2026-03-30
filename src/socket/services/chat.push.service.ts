import { Injectable } from '@nestjs/common';
import { SocketUtilsService } from './socket.utils.service';
import { ChatGateway } from 'socket/gateways/chat.gateway';
import { RedisService } from 'shared/services/redis/redis.service';
import { GatewayConstants, RedisKeys } from 'shared/common';
import { ChatSocketEvents } from 'shared/enums';
import { IMsgPayload } from '../interfaces/msg.payload';

// 只负责提供推送功能

@Injectable()
export class ChatPushService {
  constructor(
    private readonly redisService: RedisService,
    private readonly socketUtilsService: SocketUtilsService,
    private readonly chatGateway: ChatGateway,
  ) {}

  async getConvMembers(cid: string): Promise<string[]> {
    return await this.redisService
      .getClient()
      .smembers(RedisKeys.convMembers(cid));
  }

  async pushPrivateMessage(userId: string, payload: IMsgPayload) {
    const socketIds = await this.socketUtilsService.getUserSocketIds(
      [userId],
      GatewayConstants.CHAT_NAMESPACE,
    );

    socketIds.forEach((socketId) => {
      this.chatGateway.server
        .to(socketId)
        .emit(ChatSocketEvents.NEW_MESSAGE, payload);
    });
  }

  // todo 群聊实现不一样
  async pushGroupMessage(payload: IMsgPayload) {
    const { message } = payload;
    const { conversationId: cid } = message;
    const members = await this.getConvMembers(cid);
    const toUserIds: string[] = members.filter((m) => m !== message.senderId);
    const socketIds = await this.socketUtilsService.getUserSocketIds(
      toUserIds,
      GatewayConstants.CHAT_NAMESPACE,
    );

    socketIds.forEach((socketId) => {
      this.chatGateway.server
        .to(socketId)
        .emit(ChatSocketEvents.NEW_MESSAGE, { message });
    });
  }
}
