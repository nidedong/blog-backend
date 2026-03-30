import { ProfileService } from 'user/services/profile.service';
import { Injectable } from '@nestjs/common';
import { ApiException } from 'shared/exception';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FriendRequestEntity } from 'user/entities/friend.request.entity';
import { FriendReqStatus } from 'user/interfaces';
import { head } from 'lodash';
import { NotificationService } from 'notify/services/notification.service';
import { ConversationService } from 'chat/services/conversation.service';

@Injectable()
export class GetProfileUseCase {
  constructor(
    @InjectRepository(FriendRequestEntity)
    private readonly friendRequestRepo: Repository<FriendRequestEntity>,
    private readonly profileService: ProfileService,
    private readonly notificationService: NotificationService,
    private readonly convService: ConversationService,
  ) {}

  async execute(userId: string) {
    const user = head(await this.profileService.ensureGetProfiles([userId]));

    if (!user) {
      throw ApiException.tipError('user.user_not_exist');
    }

    // todo 计算消息统计
    const unreadNotifycationCount =
      await this.notificationService.getUnreadCount(userId);

    // 好友请求
    const friendReqCount = await this.friendRequestRepo.countBy({
      status: FriendReqStatus.Waiting,
      receiverId: userId,
    });

    const messageCount = await this.convService.getUnreadCountTotal(userId);

    return {
      ...user,
      badges: {
        notification: unreadNotifycationCount,
        message: messageCount,
        friendreq: friendReqCount,
      },
    };
  }
}
