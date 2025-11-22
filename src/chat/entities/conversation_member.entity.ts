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
  })
  userId: string;

  @ManyToOne(() => ConversationEntity)
  @JoinColumn({
    name: 'conversationId',
  })
  conversation: ConversationEntity;

  @CreateDateColumn()
  joinedAt: Date;
}
