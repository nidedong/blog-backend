import { RedisService } from 'shared/services/redis/redis.service';
import { Inject, Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { ConversationMemberEntity } from 'chat/entities/conversation_member.entity';
import { ConversationEntity } from 'chat/entities/conversation.entity';
import { DataSource, In, Repository } from 'typeorm';
import { UserEntity } from 'user/entities/user.entity';
import { ApiException } from 'shared/exception';
import { ConversationType } from 'chat/interfaces';
import { plainToInstance } from 'class-transformer';
import { ConversationVo } from 'chat/vos/conversation.vo';
import { flatten, isNil, keyBy, nth, sum } from 'lodash';
import { RedisKeys } from 'shared/common/redis.keys';
import { CreateGroupConvDto } from 'chat/dtos/conversation/create.group.conv.dto';
import { ProfileService } from 'user/services/profile.service';
import { ServiceNameEnum } from 'shared/enums';
import { MessageUnreadService } from './message.unread.service';
import { ConvMembersService } from './conv.members.services';

@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(ConversationMemberEntity)
    private readonly conversationMemberRepo: Repository<ConversationMemberEntity>,
    @InjectRepository(ConversationEntity)
    private readonly conversationRepo: Repository<ConversationEntity>,
    @InjectRepository(UserEntity)
    private readonly uerRepo: Repository<UserEntity>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly redisService: RedisService,
    private readonly profileService: ProfileService,
    @Inject(ServiceNameEnum.MessageUnreadService)
    private readonly msgUnreadService: MessageUnreadService,
    private readonly convMembersService: ConvMembersService,
  ) {}

  createP2PKeys(users: [string, string]) {
    return [users.join('_'), users.reverse().join('_')];
  }

  createP2PKey(users: [string, string]) {
    return users.join('_');
  }

  async ensureUserConvs(userId: string) {
    const cids = await this.redisService
      .getClient()
      .zrevrange(RedisKeys.userConvs(userId), 0, -1);

    if (cids.length > 0) return cids;

    // db兜底
    const cvList = await this.conversationRepo
      .createQueryBuilder('m')
      .innerJoin('m.members', 'cm', 'cm.user_id = :userId', { userId })
      .select(['m.id', 'm.last_message_seq'])
      .groupBy('m.id')
      .orderBy('m.last_message_seq', 'DESC')
      .getMany();

    if (cvList.length === 0) return [];

    await this.redisService
      .getClient()
      .zadd(
        RedisKeys.userConvs(userId),
        ...flatten(cvList.map((cv) => [cv.lastMessageSeq ?? 0, cv.id])),
      );

    return cvList.map((item) => item.id);
  }

  async ensureConversationBase(cids: string[]) {
    const keys = cids.flatMap((cid) => [
      RedisKeys.convType(cid),
      RedisKeys.convInfo(cid),
      RedisKeys.lastMsg(cid),
    ]);
    const values = await this.redisService.safeMget(keys);

    const misscIds = new Set<string>();

    for (let i = 0; i < cids.length; i++) {
      // convType丢失其他数据都不可信，需要重新创建
      if (!values[i * 3]) {
        misscIds.add(cids[i]);
      }
    }
    if (misscIds.size === 0) return values;
    const rows = await this.conversationRepo
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.members', 'cm')
      .leftJoinAndSelect('c.lastMessage', 'clm')
      .where('c.id IN (:...ids)', { ids: [...misscIds] })
      .getMany();

    const pipeline = this.redisService.getClient().pipeline();
    for (const row of rows) {
      pipeline.set(RedisKeys.convType(row.id), row.type);
      pipeline
        .del(RedisKeys.convMembers(row.id))
        .sadd(
          RedisKeys.convMembers(row.id),
          ...row.members.map((m) => m.userId),
        );
      pipeline.set(
        RedisKeys.convInfo(row.id),
        JSON.stringify(plainToInstance(ConversationVo, row)),
      );
      if (row.lastMessage) {
        pipeline.set(
          RedisKeys.lastMsg(row.id),
          JSON.stringify(row.lastMessage),
        );
      }
    }

    pipeline.exec();
  }

  async getList(userId: string) {
    const cids = await this.ensureUserConvs(userId);

    let baseValues = await this.ensureConversationBase(cids);

    // redis失效重新获取
    if (!baseValues) {
      const keys: string[] = [];

      for (const cid of cids) {
        keys.push(
          RedisKeys.convType(cid),
          RedisKeys.convInfo(cid),
          RedisKeys.lastMsg(cid),
        );
      }

      baseValues = await this.redisService.safeMget(keys);
    }

    const unreadMap = await this.msgUnreadService.getUnreadCount(userId, cids);

    const members = await this.convMembersService.getMembers();

    // 组装返回值
    const tmps: any[] = [];

    for (let i = 0; i < cids.length; i++) {
      const cid = cids[i];
      const base = i * 4;
      const type = baseValues[base];
      tmps.push({
        cid,
        type: isNil(type) ? type : Number(type),
        members: baseValues[base + 1],
        convInfo: baseValues[base + 1]
          ? JSON.parse(baseValues[base + 1])
          : undefined,
        lastMsg: baseValues[base + 2]
          ? JSON.parse(baseValues[base + 2])
          : undefined,
      });
    }

    // 获取私聊用户信息
    const userIds = tmps
      .filter((t) => t.type === ConversationType.PRIVATE)
      .map((t) => t.members.find((m) => m !== userId))
      .filter(Boolean);

    const profiles = await this.profileService.ensureGetProfiles(userIds);

    const userMap: Record<string, UserEntity> = keyBy(profiles, 'id');

    const conversation = [];
    // 设置未读信息数量
    for (const tmp of tmps) {
      if (tmp.type === ConversationType.PRIVATE) {
        // 私聊
        const targetUserid = tmp.members.find((m) => m !== userId);
        conversation.push({
          ...tmp.convInfo,
          type: tmp.type,
          id: tmp.cid,
          lastMessage: tmp.lastMsg,
          members: [userMap[targetUserid]].filter(Boolean),
          unreadCount: unreadMap[tmp.cid],
        });
      } else {
        conversation.push({
          ...tmp.convInfo,
          type: tmp.type,
          id: tmp.cid,
          lastMessage: tmp.lastMsg,
          members: tmp.members,
          unreadCount: unreadMap[tmp.cid],
        });
      }
    }

    return conversation;
  }

  async createConvBase() {}

  // 私聊
  async createPrivateChat(ids: string[], extra?: Partial<ConversationEntity>) {
    const users = await this.uerRepo.findBy({
      id: In(ids),
    });

    if (users.length < 2 || users.some((u) => !u)) {
      throw ApiException.tipError('user.user_not_exist');
    }

    const members = users.map((u) => u.id).sort();

    const p2pKeys = this.createP2PKeys([nth(members, 0), nth(members, 1)]);

    const existConversation = await this.conversationRepo.findOneBy({
      p2pKey: In(p2pKeys),
    });
    // 会话已经存在,返回已有会话
    if (existConversation) {
      return plainToInstance(ConversationVo, {
        ...existConversation,
        members: users,
        ...(await this.getList(nth(ids, 0)))?.find(
          (item) => item.id === existConversation.id,
        ),
      });
    }

    const conversation = this.conversationRepo.create({
      type: ConversationType.PRIVATE,
      p2pKey: this.createP2PKey([nth(members, 0), nth(members, 1)]),
      lastMessageSeq: 0,
      ...extra,
    });

    //私聊不需要title
    await this.dataSource.transaction(async (entityManager) => {
      await entityManager.insert(ConversationEntity, conversation);
      users.forEach(async (u) => {
        await entityManager.insert(
          ConversationMemberEntity,
          this.conversationMemberRepo.create({
            conversationId: conversation.id,
            userId: u.id,
            joinedAt: new Date(),
          }),
        );
      });
    });

    const pipeline = this.redisService.getClient().pipeline();
    pipeline.set(RedisKeys.convType(conversation.id), ConversationType.PRIVATE);
    pipeline.sadd(RedisKeys.convMembers(conversation.id), ...members);
    pipeline.set(
      RedisKeys.convInfo(conversation.id),
      JSON.stringify(conversation),
    );
    pipeline.zadd(
      RedisKeys.userConvs(nth(members, 0)),
      Date.now(),
      conversation.id,
    );
    pipeline.zadd(
      RedisKeys.userConvs(nth(members, 1)),
      Date.now(),
      conversation.id,
    );

    await pipeline.exec();

    const onlineStatus = await this.redisService
      .getClient()
      .smismember(RedisKeys.onlineUsers(), ...users.map((u) => u.id));

    return plainToInstance(
      ConversationVo,
      {
        ...conversation,
        unreadCount: 0,
        members: users.map((u, i) => ({
          ...u,
          isOnline: onlineStatus[i] === 1,
        })),
        lastMessage: undefined,
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }

  // 群聊
  async createGroupChat(dto: CreateGroupConvDto) {}

  // 根据私聊用户获取会话信息
  getPrivateConversationByUsers(users: [string, string]) {
    return this.conversationRepo.findOneBy({
      type: ConversationType.PRIVATE,
      p2pKey: In(this.createP2PKeys(users)),
    });
  }

  // 根据私聊用户获取会话信息列表
  getPrivateConversationListByUsers(users: [string, string][]) {
    return this.conversationRepo.find({
      where: {
        type: ConversationType.PRIVATE,
        p2pKey: In(flatten(users.map((us) => this.createP2PKeys(us)))),
      },
    });
  }

  async getUnreadCountTotal(userId: string) {
    const cids = await this.ensureUserConvs(userId);
    const unreadCountMap = await this.msgUnreadService.getUnreadCount(
      userId,
      cids,
    );
    return sum(Object.values(unreadCountMap));
  }
}
