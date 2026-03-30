import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { isNil, omit } from 'lodash';
import {
  BroadCastMessageDto,
  GetNotifyListParamsDto,
  ReadNotificationParamsDto,
} from 'notify/dtos/notification.dto';
import { NotificationBroadCastEntity } from 'notify/entities/notification_broadcast.entity';
import { NotificationUserEntity } from 'notify/entities/notification_user.entity';
import { EventNames } from 'shared/enums';
import { ApiException } from 'shared/exception';
import { Repository } from 'typeorm';
import { UserRepository } from 'user/repositories/user.repository';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(NotificationUserEntity)
    private readonly notificationUserRepo: Repository<NotificationUserEntity>,
    @InjectRepository(NotificationBroadCastEntity)
    private readonly notificationBroadCastRepo: Repository<NotificationBroadCastEntity>,
    private readonly userRepo: UserRepository,
    private readonly emitter: EventEmitter2,
  ) {}

  async getNotifyList(userId: string, dto: GetNotifyListParamsDto) {
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

    // 返回剩余未读数量
    return await this.getUnreadCount;
  }

  getUnreadCount(userId: string) {
    return this.notificationUserRepo.countBy({
      userId,
      isRead: false,
    });
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

    this.emitter.emit(EventNames.SYSTEM_BROADCAST, {
      broadcastId: broadcast.id,
      ...omit(broadcast, 'id'),
    });
  }
}
