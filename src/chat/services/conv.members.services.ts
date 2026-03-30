import { RedisService } from 'shared/services/redis/redis.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConversationMemberEntity } from 'chat/entities/conversation_member.entity';
import { ApiException } from 'shared/exception';
import { In, Repository } from 'typeorm';
import { RedisKeys } from 'shared/common';
import { plainToInstance } from 'class-transformer';
import { ConvMemberVo } from 'chat/vos/conv-member.vo';

@Injectable()
export class ConvMembersService {
  constructor(
    @InjectRepository(ConversationMemberEntity)
    private readonly convMemberRepo: Repository<ConversationMemberEntity>,
    private readonly redisService: RedisService,
  ) {}

  async getMemberInfo(cid: string, userId: string) {
    const row = await this.convMemberRepo.findOne({
      where: {
        conversationId: cid,
        userId,
      },
      relations: {
        user: true,
      },
    });

    if (!row) {
      throw ApiException.tipError('error.member_not_in_conv', {
        userId,
        cid,
      });
    }

    return plainToInstance(ConvMemberVo, row, {
      excludeExtraneousValues: true,
    });
  }

  async getMembersMap(cids: string[]) {
    const pipeline = this.redisService.getClient().pipeline();
    cids.forEach((cid) => {
      pipeline.exists(RedisKeys.convMembers(cid));
    });

    const payloads = await pipeline.exec();
    const missIds = [];
    const existIds = [];
    payloads.forEach(([, result], index) => {
      if (result === 1) {
        existIds.push(cids[index]);
      } else {
        missIds.push(cids[index]);
      }
    });

    const map: Record<string, ConvMemberVo[]> = {};
    if (existIds.length > 0) {
      const pipeline = this.redisService.getClient().pipeline();
      existIds.forEach((cid) => {
        pipeline.smembers(cid);
      });

      const existRes = await pipeline.exec();

      existRes.forEach(([, res], index) => {
        map[existIds[index]] = plainToInstance(ConvMemberVo, res as any[]);
      });
    }

    if (missIds.length > 0) {
    }
  }

  async getMembers(cid: string) {
    const userIds = await this.redisService
      .getClient()
      .smembers(RedisKeys.convMembers(cid));

    let rows: ConversationMemberEntity[] = [];

    if (userIds.length > 0) {
      rows = await this.convMemberRepo.find({
        where: {
          conversationId: cid,
          userId: In(userIds),
        },
        relations: {
          user: true,
        },
      });
    } else {
      rows = await this.convMemberRepo.find({
        where: {
          conversationId: cid,
        },
        relations: {
          user: true,
        },
      });
    }

    return plainToInstance(ConvMemberVo, rows, {
      excludeExtraneousValues: true,
    });
  }

  async inviteMembers(cid: string, userIds: string[]) {
    const rows = userIds.map((userId) =>
      this.convMemberRepo.create({
        conversationId: cid,
        joinedAt: new Date(),
        userId,
      }),
    );
    await this.convMemberRepo.insert(rows);
    await this.redisService.del(RedisKeys.convMembers(cid));
  }

  async delMembers(cid: string, ids: string[]) {
    await this.convMemberRepo.delete(ids);
    await this.redisService.del(RedisKeys.convMembers(cid));
  }
}
