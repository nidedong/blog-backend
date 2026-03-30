import { RedisService } from 'shared/services/redis/redis.service';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ConversationVo } from 'chat/vos/conversation.vo';
import { EventNames, NotifySocketEvents, ServiceNameEnum } from 'shared/enums';
import { NotificationPushService } from 'socket/services/notification.push.service';
import { RedisKeys } from 'shared/common';
import { Repository } from 'typeorm';
import { MessageEntity } from 'chat/entities/message.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ConversationMemberEntity } from 'chat/entities/conversation_member.entity';
import { MessageUnreadService } from 'chat/services/message.unread.service';

@Injectable()
export class ConvListener {
  private readonly logger = new Logger(ConvListener.name);

  constructor(
    private readonly notificationPushService: NotificationPushService,
    private readonly redisService: RedisService,
    @InjectRepository(MessageEntity)
    private readonly messageRepo: Repository<MessageEntity>,
    @InjectRepository(ConversationMemberEntity)
    private readonly convMemberRepo: Repository<ConversationMemberEntity>,
    @Inject(ServiceNameEnum.MessageUnreadService)
    private readonly msgUnreadService: MessageUnreadService,
  ) {}

  @OnEvent(EventNames.NEW_CONV)
  async handleCreateConv({
    userId,
    conversation,
  }: {
    userId: string;
    conversation: ConversationVo;
  }) {
    this.notificationPushService.notifyUser(
      userId,
      NotifySocketEvents.NEW_PRIVATE_CONVERSATION,
      conversation,
    );
  }

  @OnEvent(EventNames.MSG_INDEX_BATCH_REBUILD)
  async handleBatchRebuildMsgIndex(cids: string[]) {
    cids.forEach((cid) => this.rebuildMsgIndex(cid));
  }

  async rebuildMsgIndex(cid: string) {
    this.redisService.withLock(
      RedisKeys.msgIdxRebuildLock(cid),
      async () => {
        // 双重检查
        const exist = await this.redisService
          .getClient()
          .exists(RedisKeys.msgIdx(cid));
        if (exist) return;

        const rows = await this.messageRepo.find({
          where: {
            conversationId: cid,
          },
          select: ['id', 'seq'],
          order: {
            seq: 'ASC',
          },
        });

        if (rows.length === 0) return;

        await this.redisService
          .getClient()
          .zadd(
            RedisKeys.msgIdx(cid),
            ...rows.flatMap((row) => [row.seq, row.id]),
          );
      },
      {
        onFail: () => {
          this.logger?.log(`MSG_IDX_REBUILD skipped, lock held: cid=${cid}`);
        },
      },
    );
  }

  @OnEvent(EventNames.CONV_READ_UPDATED)
  async syncReadToDb({
    userId,
    cid,
    readSeq,
  }: {
    userId: string;
    cid: string;
    readSeq: number;
  }) {
    try {
      const [messageId] = await this.redisService
        .getClient()
        .zrangebyscore(RedisKeys.msgIdx(cid), readSeq, readSeq, 'LIMIT', 0, 1);

      if (!messageId) {
        this.logger.error('syncReadToDb messageId not existed', messageId);
        return;
      }
      await this.convMemberRepo.update(
        {
          conversationId: cid,
          userId,
        },
        {
          lastReadMessageId: messageId,
        },
      );
    } catch (error) {
      this.logger.error('syncReadToDb fail', error);
    }
  }

  @OnEvent(EventNames.CONV_UNREAD_UPDATED)
  async handleConvUnreadUpdated({
    userId,
    convId,
  }: {
    userId: string;
    convId: string;
  }) {
    const unreadMap = await this.msgUnreadService.getUnreadCount(userId, [
      convId,
    ]);
    const unreadCount = unreadMap[convId];
    await this.notificationPushService.notifyUser(
      userId,
      NotifySocketEvents.CONV_UNREAD_UPDATED,
      {
        convId,
        unreadCount,
      },
    );
  }
}
