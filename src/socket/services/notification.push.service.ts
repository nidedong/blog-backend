import { Injectable } from '@nestjs/common';
import { NotificationGateway } from 'socket/gateways/notification.gateway';
import { SocketUtilsService } from './socket.utils.service';
import { NotifySocketEvents } from 'shared/enums';
import { GatewayConstants } from 'shared/common';

// 只负责提供推送功能

@Injectable()
export class NotificationPushService {
  constructor(
    private readonly socketUtilsService: SocketUtilsService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  /** 通知广播 */
  async broadcast(payload: any) {
    this.notificationGateway.server.emit(NotifySocketEvents.BROADCAST, payload);
  }

  /** 通知指定用户 */
  async notifyUser(userId: string, event: string, payload: any) {
    const isOnline = await this.socketUtilsService.isUserOnline(userId);
    if (!isOnline) {
      return;
    }
    const socketId = await this.socketUtilsService.getUserSocketId(
      userId,
      GatewayConstants.NOTIFICATION_NAMESPACE,
    );

    if (!socketId) return false;

    this.notifySocket(socketId, event, payload);
  }

  /**
   * 根据好友id批量通知
   */
  async notifyUserBatch(userIds: string[], event: string, payload: any) {
    const onlineUserids = await this.socketUtilsService.getOnlineUsers(userIds);
    if (onlineUserids.length === 0) return;
    const socketIds = await this.socketUtilsService.getUserSocketIds(
      onlineUserids,
      GatewayConstants.NOTIFICATION_NAMESPACE,
    );

    this.notifySocketBatch(socketIds, event, payload);
  }

  /**
   * 通知单个socketId
   */
  async notifySocket(socketId: string, event: string, payload: any) {
    this.notifySocketBatch([socketId], event, payload);
  }

  /**
   * 根据socketId批量通知
   */
  async notifySocketBatch(socketIds: string[], event: string, payload: any) {
    socketIds.forEach((socketId) => {
      this.notificationGateway.server.to(socketId).emit(event, payload);
    });
  }
}
