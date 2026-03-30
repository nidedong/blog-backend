import { EventEmitter2 } from '@nestjs/event-emitter';
import { RedisService } from 'shared/services/redis/redis.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConversationMemberEntity } from 'chat/entities/conversation_member.entity';
import { MessageEntity } from 'chat/entities/message.entity';
import { Repository } from 'typeorm';
import { RedisKeys } from 'shared/common/redis.keys';
import { ConvRebuildService } from './conv.rebuild.service';
import { IMessageUnreadService } from 'shared/interfaces';
import { EventNames } from 'shared/enums';

@Injectable()
export class MessageUnreadService implements IMessageUnreadService {
  constructor(
    @InjectRepository(ConversationMemberEntity)
    private readonly convMemberRepo: Repository<ConversationMemberEntity>,
    private readonly redisService: RedisService,
    private readonly convRebuildService: ConvRebuildService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async getUnreadCount(userId: string, cids: string[]) {
    const redisKeys = cids.map((cid) => RedisKeys.userLastReadSeq(cid, userId));

    const readSeqs = await this.redisService.safeMget(redisKeys);

    const result: Record<string, number> = {};
    const missCids: string[] = [];

    readSeqs.forEach((seq, index) => {
      const cid = cids[index];
      if (seq === null) {
        missCids.push(cid);
      } else {
        result[cid] = Number(seq);
      }
    });

    // rebuild
    if (missCids.length > 0) {
      const rows = await this.convMemberRepo
        .createQueryBuilder('cm')
        .leftJoin(MessageEntity, 'mg', 'cm.lastReadMessageId = mg.id')
        .select(['cm.conversation_id', 'mg.seq AS seq'])
        .where('cm.conversation_id In (:...ids)', { ids: missCids })
        .getRawMany();

      const pipeline = await this.redisService.getClient().pipeline();
      rows.forEach((m) => {
        const cid = m.conversation_id;
        const seq = m.seq != null ? Number(m.seq) : 0;
        result[cid] = seq;
        pipeline.set(RedisKeys.userLastReadSeq(cid, userId), seq);
      });

      await pipeline.exec();
    }

    const pipeline = this.redisService.getClient().pipeline();

    cids.forEach((cid) => {
      const readSeq = result[cid] ?? 0;
      pipeline.zcount(RedisKeys.msgIdx(cid), `(${readSeq}`, '+inf');
    });

    const replies = await pipeline.exec();
    const rebuildMsgCids: string[] = [];

    replies.forEach(([, count], index) => {
      if (count === 0) {
        result[cids[index]] = 0;
        rebuildMsgCids.push(cids[index]);
      } else {
        result[cids[index]] = Number(count);
      }
    });

    //异步恢复msgIndex
    if (rebuildMsgCids.length > 0) {
      this.convRebuildService.msgIdx(rebuildMsgCids);
    }

    return result;
  }

  async readMsg(userId: string, cid: string, readSeq: number) {
    const lastReadSeq = Number(
      (await this.redisService.get(RedisKeys.userLastReadSeq(cid, userId))) ||
        0,
    );

    if (lastReadSeq >= readSeq) return;

    await this.redisService.set(
      RedisKeys.userLastReadSeq(cid, userId),
      readSeq,
    );

    // 异步落库
    this.eventEmitter.emit(EventNames.CONV_READ_UPDATED, {
      userId,
      cid,
      readSeq,
    });
  }
}
