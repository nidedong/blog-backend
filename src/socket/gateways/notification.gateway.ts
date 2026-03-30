import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { GatewayConstants } from 'shared/common';
import { Server, Socket } from 'socket.io';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventNames } from 'shared/enums';
import { JwtUserData } from 'typing';

@WebSocketGateway(GatewayConstants.SOCKET_PORT, {
  namespace: GatewayConstants.NOTIFICATION_NAMESPACE,
  cors: {
    origin: '*', // 允许所有源
  },
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly eventEmitter: EventEmitter2) {}

  @WebSocketServer()
  server: Server;

  async handleConnection(client: Socket) {
    const user = client.data?.user as JwtUserData;
    this.eventEmitter.emit(EventNames.SOCKET_CONNECTED, {
      clientId: client.id,
      userId: user.id,
      namespace: client.nsp.name,
    });
  }

  async handleDisconnect(client: Socket) {
    const user = client.data?.user as JwtUserData;
    this.eventEmitter.emit(EventNames.SOCKET_DISCONNECTED, {
      clientId: client.id,
      userId: user.id,
      namespace: client.nsp.name,
    });
  }
}
