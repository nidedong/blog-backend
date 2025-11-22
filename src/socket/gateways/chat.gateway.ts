import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { GatewayConstants } from 'shared/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway(GatewayConstants.SOCKET_PORT, {
  namespace: GatewayConstants.CHAT_NAMESPACE,
  cors: {
    origin: '*', // 允许所有源
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket, ...args: any[]) {}

  handleDisconnect(client: Socket) {}
}
