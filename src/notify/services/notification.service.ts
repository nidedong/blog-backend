import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isNil, omit } from 'lodash';
import {
  BroadCastMessageDto,
  GetNotifyListParamsDto,
  ReadNotificationParamsDto,
} from 'notify/dtos/notification.dto';
import { NotificationBroadCastEntity } from 'notify/entities/notification_broadcast.entity';
import { NotificationUserEntity } from 'notify/entities/notification_user.entity';
import { NotificationMessage } from 'shared/enums';
import { ApiException } from 'shared/exception';
import { NotificationGateway } from 'socket/gateways/notification.gateway';
import { Repository } from 'typeorm';
import { UserRepository } from 'user/repositories/user.repository';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(NotificationUserEntity)
    private readonly notificationUserRepo: Repository<NotificationUserEntity>,
    @InjectRepository(NotificationBroadCastEntity)
    private readonly notificationBroadCastRepo: Repository<NotificationBroadCastEntity>,
    private readonly notifyGateway: NotificationGateway,
    private readonly userRepo: UserRepository,
  ) {}

  async getNotifyList(userId: string, dto: GetNotifyListParamsDto) {
    const exist = await this.userRepo.existsBy({
      id: userId,
    });

    if (!exist) {
      ApiException.tipError('user.user_not_exist');
    }

    const where: Record<string, any> = {
      userId,
    };

    if (!isNil(dto.isRead)) {
      where.isRead = dto.isRead;
    }

    const list = await this.notificationUserRepo.find({
      where,
      relations: ['notification'],
    });

    return list.map((item) => ({ ...item.notification, ...item }));
  }

  async readNotification(userId: string, dto: ReadNotificationParamsDto) {
    // 不是新接收到的通知
    if (dto.notifyId) {
      await this.notificationUserRepo.update(dto.notifyId, {
        isRead: true,
      });
    } else {
      const notification = await this.notificationUserRepo.findOneBy({
        broadcastId: dto.broadcastId,
        userId,
      });
      if (!notification) {
        throw ApiException.tipError('notify.notification_not_exist');
      }

      await this.notificationUserRepo.update(notification.id, {
        isRead: true,
      });
    }
  }

  async broadcastNotify(dto: BroadCastMessageDto) {
    const broadcast = new NotificationBroadCastEntity();
    broadcast.title = dto.title;
    broadcast.content = dto.content;
    broadcast.metadata = dto.metadata;
    broadcast.senderId = dto.senderId;
    broadcast.type = dto.type;

    await this.notificationBroadCastRepo.save(broadcast);

    // todo 可针对大量数据进行优化
    const users = await this.userRepo.find({
      withDeleted: false,
    });

    await this.notificationUserRepo.insert(
      users.map((user) => {
        const notificationUser = new NotificationUserEntity();
        notificationUser.userId = user.id;
        notificationUser.broadcastId = broadcast.id;
        notificationUser.delivered = true;
        return notificationUser;
      }),
    );

    await this.notifyGateway.server.emit(NotificationMessage.BROADCAST, {
      broadcastId: broadcast.id,
      ...omit(broadcast, 'id'),
    });
  }
}
