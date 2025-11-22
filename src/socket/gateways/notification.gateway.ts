import { RedisService } from './../../shared/services/redis/redis.service';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { GatewayConstants, RedisPrefix } from 'shared/common';
import { NotificationMessage } from 'shared/enums';
import { Server, Socket } from 'socket.io';

@WebSocketGateway(GatewayConstants.SOCKET_PORT, {
  namespace: GatewayConstants.NOTIFICATION_NAMESPACE,
  cors: {
    origin: '*', // 允许所有源
  },
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly redisService: RedisService) {}

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    const user = client.data?.user;
    if (!user) return;
    this.redisService
      .getClient()
      .sadd(RedisService.gk(RedisPrefix.OnlineUser, user.id), client.id);
  }

  handleDisconnect(client: Socket) {
    const user = client.data?.user;
    if (!user) return;
    this.redisService
      .getClient()
      .srem(RedisService.gk(RedisPrefix.OnlineUser, user.id), client.id);
  }

  /** 通知指定用户 */
  async notifyUser(userId: string, event: string, payload: any) {
    const socketIds = await this.redisService
      .getClient()
      .smembers(RedisService.gk(RedisPrefix.OnlineUser, userId));

    if (!socketIds.length) return false;

    for (const id of socketIds) {
      this.server.to(id).emit(event, payload);
    }

    return true;
  }

  @SubscribeMessage(NotificationMessage.BROADCAST)
  handleBroadcast(@MessageBody() data: string) {
    this.server.emit(data);
  }

  @SubscribeMessage(NotificationMessage.NOTIFY)
  handleNotify(@ConnectedSocket() client: Socket, @MessageBody() data: string) {
    console.log('-----emit');
    client.emit('WELCOME', '123');
  }
}
