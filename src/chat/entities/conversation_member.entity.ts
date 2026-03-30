import { BaseEntity } from 'shared/entities/base.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { ConversationEntity } from './conversation.entity';
import { UserEntity } from 'user/entities/user.entity';

@Entity('conversation_member')
@Index('idx_conversationId', ['conversationId'])
@Index('idx_userId', ['userId'])
@Index('uniq_conversation_user', ['conversationId', 'userId'], { unique: true })
export class ConversationMemberEntity extends BaseEntity {
  @Column({
    type: 'uuid',
    name: 'conversation_id',
  })
  conversationId: string;

  @Column({
    type: 'uuid',
    name: 'last_read_message_id',
    nullable: true,
  })
  lastReadMessageId?: string;

  @Column({
    type: 'uuid',
    name: 'user_id',
  })
  userId: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({
    name: 'user_id',
  })
  user: UserEntity;

  @ManyToOne(() => ConversationEntity)
  @JoinColumn({
    name: 'conversation_id',
  })
  conversation: ConversationEntity;

  @CreateDateColumn({
    name: 'join_at',
  })
  joinedAt: Date;

  @CreateDateColumn({
    name: 'last_active_at',
    nullable: true,
  })
  lastActiveAt?: Date;
}
