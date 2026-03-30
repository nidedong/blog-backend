import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { GatewayConstants } from 'shared/common';
import { ChatSocketEvents, EventNames } from 'shared/enums';
import { Server, Socket } from 'socket.io';
import { JwtUserData } from 'typing';

@WebSocketGateway(GatewayConstants.SOCKET_PORT, {
  namespace: GatewayConstants.CHAT_NAMESPACE,
  cors: {
    origin: '*', // 允许所有源
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly eventEmitter: EventEmitter2) {}

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

  @SubscribeMessage(ChatSocketEvents.CLIENT_MSG_READ)
  async handleMessageRead(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: { conversationId: string; readSeq: number },
  ) {
    const user = socket.data?.user as JwtUserData;
    // 基础校验（权限 / cid 是否属于用户）
    if (!payload?.conversationId || !payload?.readSeq) return;

    this.eventEmitter.emit(EventNames.MESSAGE_READ, {
      userId: user.id,
      ...payload,
    });
  }
}
