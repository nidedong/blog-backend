import { RedisService } from './../services/redis/redis.service';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Namespace, Server, ServerOptions, Socket } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { HttpStatus, INestApplicationContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CommonException, ServerException } from 'shared/exception';
import dayjs from 'dayjs';
import { GatewayConstants } from 'shared/common';

export class RedisIoAdapter extends IoAdapter {
  constructor(private app: INestApplicationContext) {
    super(app);
  }

  createIOServer(port: number, options?: ServerOptions): Server {
    const server: Server = super.createIOServer(port, options);
    const redisService = this.app.get(RedisService);
    const jwtService = this.app.get(JwtService);

    const redisAdapter = createAdapter(
      redisService.getClient(),
      redisService.getSubClient(),
    );
    server.adapter(redisAdapter);

    const attachAuth = (nsp: Namespace) => {
      /**
       * 1. 连接阶段进行 JWT 授权
       */
      nsp.use(async (socket: Socket, next) => {
        const token = socket.handshake.auth?.token;

        if (!token) {
          next(
            new ServerException(
              CommonException.UNAUTHORIZED,
              HttpStatus.UNAUTHORIZED,
            ),
          );
        }

        try {
          const payload = await jwtService.verifyAsync(token);
          socket.data.user = payload;
          next();
        } catch {
          next(
            new ServerException(
              CommonException.UNAUTHORIZED,
              HttpStatus.UNAUTHORIZED,
            ),
          );
        }
      });

      /**
       * 2. 每条消息都经过 packet middleware，可判断 token 是否失效
       */
      nsp.on('connection', (socket: Socket) => {
        socket.use((packet, next) => {
          const user = socket.data.user;
          if (!user || user.exp * 1000 <= Date.now()) {
            socket.emit('token_expired');
            return socket.disconnect();
          }
          next();
        });
      });
    };

    attachAuth(server.of('/'));
    attachAuth(server.of(GatewayConstants.NOTIFICATION_NAMESPACE));
    attachAuth(server.of(GatewayConstants.CHAT_NAMESPACE));

    // server._nsps.forEach((nsp) => nsp.use(authMiddleware));

    // server.on('new_namespace', (nsp) => {
    //   attachAuth(nsp);
    // });

    // todo token过期处理

    return server;
  }
}
