import { NotificationPushService } from './../../socket/services/notification.push.service';
import { RedisService } from 'shared/services/redis/redis.service';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotifySocketEvents, EventNames } from 'shared/enums';
import { RedisKeys } from 'shared/common';
import { FriendService } from 'user/services/friend.service';
import { SocketUtilsService } from 'socket/services/socket.utils.service';
import { InstanceService } from 'shared/services/rest/instance.service';

@Injectable()
export class UserPresenceListener implements OnModuleInit {
  private HEARTBEAT_TTL = 120; // 秒
  private HEARTBEAT_INTERVAL = 80 * 1000; // 1分钟

  private disconnectTimer: Record<string, NodeJS.Timeout> = {};

  constructor(
    private readonly redisService: RedisService,
    private readonly friendService: FriendService,
    private readonly notificationPushService: NotificationPushService,
    private readonly socketUtilsService: SocketUtilsService,
    private readonly instanceService: InstanceService,
  ) {}

  async onModuleInit() {
    // 启动心跳定时器
    setInterval(() => this.refreshAllSocketTTL(), this.HEARTBEAT_INTERVAL);
  }

  async scanUserSocketsByInstance() {
    const redis = this.redisService.getClient();
    let cursor = '0';
    const keys: string[] = [];

    do {
      const [nextCursor, batch] = await redis.scan(
        cursor,
        'MATCH',
        `*:user:sockets:*:*:${this.instanceService.id}`,
        'COUNT',
        200,
      );

      cursor = nextCursor;
      keys.push(...batch);
    } while (cursor !== '0');

    return keys;
  }

  private async refreshAllSocketTTL() {
    const keys = await this.redisService.keys(
      `user:sockets:*:*:${this.instanceService.id}`,
    );

    if (keys?.length === 0) return;
    const pipeline = this.redisService.getClient().pipeline();
    keys.forEach((key) => {
      pipeline.expire(key, this.HEARTBEAT_TTL);
    });
    await pipeline.exec();
  }

  @OnEvent(EventNames.SOCKET_CONNECTED)
  async handleSocketConnect({
    clientId,
    userId,
    namespace,
  }: {
    clientId: string;
    userId: string;
    namespace: string;
  }) {
    // 清除延迟下线的状态
    if (this.disconnectTimer[`${userId}:${namespace}`]) {
      clearTimeout(this.disconnectTimer[`${userId}:${namespace}`]);
    }

    const socketRedisKey = RedisKeys.userSockets(
      userId,
      namespace,
      this.instanceService.id,
    );
    // 存储用户socket clientID
    await this.redisService.getClient().sadd(socketRedisKey, clientId);
    await this.redisService
      .getClient()
      .expire(socketRedisKey, this.HEARTBEAT_TTL);

    // 将用户添加到在线用户里
    const added = await this.redisService
      .getClient()
      .sadd(RedisKeys.onlineUsers(), userId);

    // 只在RedisKeys.onlineUsers()添加成功 时判定上线，如果已经存在返回的是0
    if (added === 1) {
      // 通知在线好友
      const friends = await this.friendService.getFriendList(userId);
      const friendIds = friends.map((item) => item.friendId);

      this.notificationPushService.notifyUserBatch(
        friendIds,
        NotifySocketEvents.FRIEND_STATUS,
        {
          isOnline: true,
          userId,
        },
      );
    }
  }

  @OnEvent(EventNames.SOCKET_DISCONNECTED)
  async handleSocketDisConnect({
    clientId,
    userId,
    namespace,
  }: {
    clientId: string;
    userId: string;
    namespace: string;
  }) {
    await this.redisService
      .getClient()
      .srem(
        RedisKeys.userSockets(userId, namespace, this.instanceService.id),
        clientId,
      );

    const count = await this.socketUtilsService.getSocketCount(userId);

    if (count <= 0) {
      const removed = await this.redisService
        .getClient()
        .srem(RedisKeys.onlineUsers(), userId);
      if (removed !== 1) return;
      // 延迟通知
      this.disconnectTimer[`${userId}:${namespace}`] = setTimeout(async () => {
        const stillOnline = await this.redisService
          .getClient()
          .sismember(RedisKeys.onlineUsers(), userId);
        // 仍然在线
        if (stillOnline) {
          return;
        }

        // 通知在线好友
        const friends = await this.friendService.getFriendList(userId);
        const friendIds = friends.map((item) => item.friendId);

        this.notificationPushService.notifyUserBatch(
          friendIds,
          NotifySocketEvents.FRIEND_STATUS,
          {
            isOnline: false,
            userId,
          },
        );
      }, 5000);
    }
  }
}
