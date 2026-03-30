import { InstanceService } from './../../shared/services/rest/instance.service';
import { Injectable } from '@nestjs/common';
import { head } from 'lodash';
import { GatewayConstants, RedisKeys } from 'shared/common';
import { RedisService } from 'shared/services/redis/redis.service';

@Injectable()
export class SocketUtilsService {
  constructor(
    private readonly redisService: RedisService,
    private readonly instanceService: InstanceService,
  ) {}

  // todo 先默认只支持一个设备
  async getUserSocketIds(userIds: string[], nsp: string) {
    if (userIds.length === 0) return [];
    const pipeline = this.redisService.getClient().pipeline();
    userIds.forEach((uid) => {
      pipeline.smembers(
        RedisKeys.userSockets(uid, nsp, this.instanceService.id),
      );
    });
    const results = await pipeline.exec();
    return results
      .filter(([err]) => !err)
      .flatMap(([, res]) => res) as string[];
  }

  async getUserSocketId(userId: string, nsp: string) {
    return head(await this.getUserSocketIds([userId], nsp));
  }

  async isUserOnline(id: string) {
    return (
      (await this.redisService
        .getClient()
        .sismember(RedisKeys.onlineUsers(), id)) === 1
    );
  }

  async getOnlineUsers(ids: string[]) {
    const statuses =
      ids.length > 0
        ? await this.redisService
            .getClient()
            .smismember(RedisKeys.onlineUsers(), ...ids)
        : [];
    return ids.filter((id, idx) => statuses[idx] === 1);
  }

  async getSocketCount(userId: string) {
    const redisKeys = [
      GatewayConstants.NOTIFICATION_NAMESPACE,
      GatewayConstants.CHAT_NAMESPACE,
    ].map((nsp) => RedisKeys.userSockets(userId, nsp, this.instanceService.id));
    const pipeline = this.redisService.getClient().pipeline();
    redisKeys.forEach((k) => pipeline.scard(k));
    const res = await pipeline.exec();

    return res.reduce((sum, [, v]) => sum + ((v as number) ?? 0), 0);
  }
}
