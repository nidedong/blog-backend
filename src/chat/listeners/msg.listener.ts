import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MessageEntity } from 'chat/entities/message.entity';
import { ConversationType } from 'chat/interfaces';
import { IMsgReadPayload } from 'chat/interfaces/msg.read.payload';
import { MessageUnreadService } from 'chat/services/message.unread.service';
import { RedisKeys } from 'shared/common';
import { EventNames, ServiceNameEnum } from 'shared/enums';
import { RedisService } from 'shared/services/redis/redis.service';
import { ChatPushService } from 'socket/services/chat.push.service';
import { SocketUtilsService } from 'socket/services/socket.utils.service';

@Injectable()
export class MsgListener {
  constructor(
    private readonly chatPushService: ChatPushService,
    @Inject(ServiceNameEnum.MessageUnreadService)
    private readonly msgUnreadService: MessageUnreadService,
    private readonly socketUtilsService: SocketUtilsService,
    private readonly redisService: RedisService,
  ) {}

  @OnEvent(EventNames.NEW_MESSAGE)
  async handleNewMsg(message: MessageEntity) {
    const convType = +(await this.redisService.get(
      RedisKeys.convType(message.conversationId),
    )) as unknown as ConversationType;

    if (convType === ConversationType.PRIVATE) {
      const members = await this.chatPushService.getConvMembers(
        message.conversationId,
      );
      const toUserId = members.find((m) => m !== message.senderId);
      if (!toUserId) return;
      await this.chatPushService.pushPrivateMessage(toUserId, {
        message,
      });
    }
    if (convType === ConversationType.GROUP) {
      // await this.chatPushService.pushGroupMessage(payload);
    }
  }

  @OnEvent(EventNames.MESSAGE_READ)
  async handleReadMsg(payload: IMsgReadPayload) {
    this.msgUnreadService.readMsg(
      payload.userId,
      payload.conversationId,
      payload.readSeq,
    );
  }
}
