import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationBroadCastEntity } from './entities/notification_broadcast.entity';
import { NotificationUserEntity } from './entities/notification_user.entity';
import { NotificationController } from './controllers/notification.controller';
import { NotificationService } from './services/notification.service';
import { UserEntity } from 'user/entities/user.entity';
import { SocketModule } from 'socket/socket.module';
import { UserModule } from 'user/user.module';
import { BroadcastListener } from './listeners/broadcast.listener.ts';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NotificationBroadCastEntity,
      NotificationUserEntity,
      UserEntity,
    ]),
    SocketModule,
    forwardRef(() => UserModule),
  ],
  controllers: [NotificationController],
  providers: [NotificationService, BroadcastListener],
  exports: [NotificationService],
})
export class NotifyModule {}
