import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { ConversationService } from 'chat/services/conversation.service';
import { ConversationVo } from 'chat/vos/conversation.vo';
import { isNil, keyBy, nth } from 'lodash';
import { EventNames } from 'shared/enums';
import { ApiException } from 'shared/exception';
import { RedisService } from 'shared/services/redis/redis.service';
import { DataSource, Repository } from 'typeorm';
import { CreateFriendReqDto } from 'user/dtos/friend/create.friend.req.dto';
import { GetFriendReqDto } from 'user/dtos/friend/get.friend.req.dto';
import { HandleFriendReqDto } from 'user/dtos/friend/handle.friend.req.dto';
import { FriendEntity } from 'user/entities/friend.entity';
import { FriendRequestEntity } from 'user/entities/friend.request.entity';
import { FriendReqStatus } from 'user/interfaces';

@Injectable()
export class FriendService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(FriendEntity)
    private readonly friendRepo: Repository<FriendEntity>,
    @InjectRepository(FriendRequestEntity)
    private readonly friendReqRepo: Repository<FriendRequestEntity>,
    private readonly redisService: RedisService,
    private readonly conversationService: ConversationService,
    private readonly emitter: EventEmitter2,
  ) {}

  getFriendRelationList(userId: string, dto: GetFriendReqDto) {
    const where: Record<string, any>[] = [
      {
        senderId: userId,
      },
      {
        receiverId: userId,
      },
    ];
    if (!isNil(dto.status)) {
      where.forEach((cond) => (cond.status = dto.status));
    }
    return this.friendReqRepo.find({
      where,
      relations: {
        receiver: true,
        sender: true,
      },
    });
  }

  getFriendRecieveList(userId: string) {
    return this.friendReqRepo.find({
      where: {
        receiverId: userId,
        status: FriendReqStatus.Waiting,
      },
      relations: {
        receiver: true,
        sender: true,
      },
    });
  }

  async createFriendReq(userId: string, dto: CreateFriendReqDto) {
    const friendReq = new FriendRequestEntity();
    friendReq.senderId = userId;
    friendReq.receiverId = dto.receiverId;
    friendReq.message = dto.message;
    friendReq.status = FriendReqStatus.Waiting;
    await this.friendReqRepo.insert(friendReq);

    const count = await this.friendReqRepo.countBy({
      status: FriendReqStatus.Waiting,
      receiverId: dto.receiverId,
    });

    // 通知接受者
    this.emitter.emit(EventNames.FRIEND_REQUEST, {
      userId: dto.receiverId,
      count,
    });
  }

  async handleFriendReq(id: string, dto: HandleFriendReqDto) {
    const friendReq = await this.friendReqRepo.findOneBy({
      id,
    });

    if (!friendReq) {
      throw ApiException.tipError('tip.api_operate_data_item_not_exist');
    }

    if (
      dto.status !== FriendReqStatus.Expire &&
      friendReq.status === FriendReqStatus.Expire
    ) {
      throw ApiException.tipError('user.friend_req_expired');
    }

    friendReq.status = dto.status;

    let conversation: ConversationVo;

    await this.dataSource.transaction(async (entityManager) => {
      await entityManager.save(FriendRequestEntity, friendReq);
      if (dto.status === FriendReqStatus.Agree) {
        const friend1 = entityManager.create(FriendEntity, {
          userId: friendReq.senderId,
          friendId: friendReq.receiverId,
        });
        const friend2 = entityManager.create(FriendEntity, {
          userId: friendReq.receiverId,
          friendId: friendReq.senderId,
        });
        await entityManager.insert(FriendEntity, [friend1, friend2]);

        // 存在对方发来的好友请求则将其过期
        const inverseReq = await entityManager.findOne(FriendRequestEntity, {
          where: {
            receiverId: friendReq.senderId,
            senderId: friendReq.receiver,
          },
        });
        if (inverseReq) {
          await entityManager.update(FriendRequestEntity, inverseReq.id, {
            status: FriendReqStatus.Expire,
          });
        }
        conversation = await this.conversationService.createPrivateChat([
          friendReq.senderId,
          friendReq.receiverId,
        ]);
      }
    });

    /**
     * 同意的一方通过返回值添加到队列
     * 接受的一方通过socket
     */

    if (!!conversation) {
      this.emitter.emit(EventNames.NEW_CONV, {
        userId: friendReq.senderId,
        conversation,
      });
    }

    const unreadCount = await this.getPendingReqCount(friendReq.receiverId);

    return { conversation, unreadCount };
  }

  async getPendingReqCount(userId: string) {
    return await this.friendReqRepo.countBy({
      receiverId: userId,
      status: FriendReqStatus.Waiting,
    });
  }

  async getFriendList(userId: string) {
    const list = await this.friendRepo.find({
      where: {
        userId,
      },
      relations: {
        friend: true,
      },
    });

    if (list.length === 0) return list;

    const conversationList =
      await this.conversationService.getPrivateConversationListByUsers(
        list.map((item) => [item.userId, item.friendId]),
      );

    const conversationMap = keyBy(conversationList, 'p2pKey') || {};

    return list.map((item) => {
      const p2pKeys = this.conversationService.createP2PKeys([
        item.userId,
        item.friendId,
      ]);
      const conversationId =
        conversationMap[nth(p2pKeys, 0)]?.id ||
        conversationMap[nth(p2pKeys, 1)]?.id;

      return {
        ...item,
        ...item.friend,
        conversationId,
      };
    });
  }
}
