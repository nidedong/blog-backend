import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationEntity } from './entities/conversation.entity';
import { ConversationMemberEntity } from './entities/conversation_member.entity';
import { MessageEntity } from './entities/message.entity';
import { ConversationController } from './controllers/conversation.controller';
import { UserEntity } from 'user/entities/user.entity';
import { ConversationService } from './services/conversation.service';
import { MessageService } from './services/message.service';
import { MessageController } from './controllers/message.controller';
import { SocketModule } from 'socket/socket.module';
import { ConvListener } from './listeners/conv.listener';
import { MsgListener } from './listeners/msg.listener';
import { UserModule } from 'user/user.module';
import { ConvRebuildService } from './services/conv.rebuild.service';
import { ServiceNameEnum } from 'shared/enums';
import { MessageUnreadService } from './services/message.unread.service';
import { ConvMemberController } from './controllers/conv.member.controller';
import { ConvMembersService } from './services/conv.members.services';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ConversationEntity,
      ConversationMemberEntity,
      MessageEntity,
      UserEntity,
    ]),
    SocketModule,
    forwardRef(() => UserModule),
  ],
  controllers: [
    ConversationController,
    MessageController,
    ConvMemberController,
  ],
  providers: [
    ConversationService,
    MessageService,
    ConvRebuildService,
    ConvListener,
    ConvMembersService,
    MsgListener,
    {
      provide: ServiceNameEnum.MessageUnreadService,
      useClass: MessageUnreadService,
    },
  ],
  exports: [
    ConversationService,
    MessageService,
    ConvRebuildService,
    ServiceNameEnum.MessageUnreadService,
  ],
})
export class ChatModule {}
