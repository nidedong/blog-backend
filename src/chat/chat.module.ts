import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationEntity } from './entities/conversation.entity';
import { ConversationMemberEntity } from './entities/conversation_member.entity';
import { MessageEntity } from './entities/message.entity';
import { ConversationController } from './controllers/conversation.controller';
import { UserEntity } from 'user/entities/user.entity';
import { ConversationService } from './services/conversation.service';
import { MessageService } from './services/message.service';
import { MessageController } from './controllers/message.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ConversationEntity,
      ConversationMemberEntity,
      MessageEntity,
      UserEntity,
    ]),
  ],
  controllers: [ConversationController, MessageController],
  providers: [ConversationService, MessageService],
})
export class ChatModule {}
