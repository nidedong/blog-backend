import { RedisService } from './../../shared/services/redis/redis.service';
import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { ConversationEntity } from 'chat/entities/conversation.entity';
import { MessageEntity } from 'chat/entities/message.entity';
import { DataSource, In, Repository } from 'typeorm';
import { CreateMsgDto } from 'chat/dtos/message/create.msg.dto';
import { GetMsgListDto } from 'chat/dtos/message/get.msg.list.dto';
import { RedisKeys } from 'shared/common';
import { initial, isNil, tail } from 'lodash';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventNames } from 'shared/enums';

@Injectable()
export class MessageService {
  private readonly MAX_MSG_INDEX = 10000;

  constructor(
    @InjectRepository(MessageEntity)
    private readonly messageRepo: Repository<MessageEntity>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly redisService: RedisService,
    private readonly emitter: EventEmitter2,
  ) {}

  private emitNewMessage(message: MessageEntity) {
    this.emitter.emit(EventNames.NEW_MESSAGE, message);
  }

  private emitConvUnreadUpdated(userId: string, convId: string) {
    this.emitter.emit(EventNames.CONV_UNREAD_UPDATED, {
      userId,
      convId,
    });
  }

  // todo
  private emitUserUnreadUpdated() {}

  async getMaxSeq(convId: string) {
    const { maxSeq } = await this.messageRepo
      .createQueryBuilder('m')
      .select('COALESCE(MAX(m.seq), 0) as maxSeq')
      .where('m.conversation_id = :convId', { convId })
      .getRawOne();
    return Number(maxSeq);
  }

  async generateSeq(convId: string): Promise<number> {
    const key = RedisKeys.msgSeq(convId);

    let seq = await this.redisService.getClient().incr(key);

    if (seq === 1) {
      // 极有可能是 Redis key 丢失
      const maxSeq = await this.getMaxSeq(convId);
      if (maxSeq >= seq) {
        seq = maxSeq + 1;
        await this.redisService.set(key, seq);
      }
    }

    return seq;
  }

  async sendMessage(senderId: string, msg: CreateMsgDto) {
    const convId = msg.conversationId;
    const seq = await this.generateSeq(convId);

    const message = await this.dataSource.transaction(async (manager) => {
      const newMsg = this.messageRepo.create({
        senderId,
        seq,
        ...msg,
      });
      await manager.save(MessageEntity, newMsg);
      await manager.update(ConversationEntity, msg.conversationId, {
        lastMessageId: newMsg.id,
        lastMessageSeq: seq,
      });
      return newMsg;
    });

    const members = await this.redisService
      .getClient()
      .smembers(RedisKeys.convMembers(convId));

    const pipeline = this.redisService.getClient().pipeline();
    // 更新最新消息
    pipeline.set(RedisKeys.lastMsg(convId), JSON.stringify(message));

    // 会话列表排序
    for (const userId of members) {
      pipeline.zadd(
        RedisKeys.userConvs(userId),
        message.createdAt.getTime(),
        convId,
      );
    }
    // 更新未读数
    pipeline.zadd(RedisKeys.msgIdx(convId), message.seq, message.id);
    // 最多保留MAX_MSG_INDEX条索引
    pipeline.zremrangebyrank(
      RedisKeys.msgIdx(convId),
      0,
      -this.MAX_MSG_INDEX - 1,
    );

    // 更新发送方seq
    pipeline.set(RedisKeys.userLastReadSeq(convId, senderId), message.seq);

    await pipeline.exec();

    // 发送通知
    this.emitNewMessage(message);
    // 更新未读数量
    for (const userId of members) {
      if (userId === senderId) continue;
      this.emitConvUnreadUpdated(userId, convId);
    }

    return {
      ...message,
      clientId: msg.clientId,
    };
  }

  async getList(params: GetMsgListDto) {
    // todo seq乱了之后进行重建
    const { conversationId, beforeSeq, afterSeq, limit } = params;
    let msgIds: string[] = [];
    let hasMoreBefore = false;
    let hasMoreAfter = false;

    // 初始获取最近limit条
    if (isNil(beforeSeq) && isNil(afterSeq)) {
      msgIds = await this.redisService
        .getClient()
        .zrevrange(RedisKeys.msgIdx(conversationId), 0, limit);
      hasMoreBefore = msgIds.length > limit;
    } else if (!isNil(beforeSeq)) {
      // 向前获取
      msgIds = await this.redisService
        .getClient()
        .zrevrangebyscore(
          RedisKeys.msgIdx(conversationId),
          `(${beforeSeq}`,
          '-inf',
          'LIMIT',
          0,
          limit + 1,
        );
      hasMoreBefore = msgIds.length > limit;
    } else if (!isNil(afterSeq)) {
      // 向后获取
      msgIds = await this.redisService
        .getClient()
        .zrangebyscore(
          RedisKeys.msgIdx(conversationId),
          `(${afterSeq}`,
          '+inf',
          'LIMIT',
          0,
          limit + 1,
        );
      hasMoreAfter = msgIds.length > limit;
    }

    //前面获取的limit+1条判断hasMoreBefore和hasMoreAfter，这里删除一条数据
    if (hasMoreBefore) {
      msgIds = initial(msgIds);
    }
    if (hasMoreAfter) {
      msgIds = tail(msgIds);
    }

    const total = +(await this.redisService.get(
      RedisKeys.msgSeq(conversationId),
    ));

    const list = await this.messageRepo.find({
      where: {
        conversationId,
        id: In(msgIds),
      },
      order: {
        seq: 'ASC',
      },
    });

    return {
      list,
      total,
      hasMoreBefore,
      hasMoreAfter,
    };
  }
}
