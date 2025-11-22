import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { isNil } from 'lodash';
import { NotificationMessage } from 'shared/enums';
import { ApiException } from 'shared/exception';
import { NotificationGateway } from 'socket/gateways/notification.gateway';
import { DataSource, Repository } from 'typeorm';
import { CreateFriendReqDto } from 'user/dtos/create.friend.req.dto';
import { GetFriendReqDto } from 'user/dtos/get.friend.req.dto';
import { HandleFriendReqDto } from 'user/dtos/handle.friend.req.dto';
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
    private readonly notificationGateway: NotificationGateway,
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
    this.notificationGateway.notifyUser(
      dto.receiverId,
      NotificationMessage.FRIEND_REQUEST,
      {
        count,
      },
    );
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
        /**
         * todo
         * 创建聊天室
         * 将聊天室数据推送给前端
         */
      }
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
    // todo 将会话id返回

    return list.map((item) => ({ ...item, ...item.friend }));
  }
}
