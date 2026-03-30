import { BaseEntity } from 'shared/entities/base.entity';
import { Column, Entity, Index } from 'typeorm';
import { MessageType, MessageStatus } from '../interfaces';

@Entity('message')
@Index('idx_conversationId_createdAt', ['conversationId', 'createdAt'])
@Index('idx_conversationId_id', ['conversationId', 'id'])
@Index('idx_conversationId_seq', ['conversationId', 'seq'])
export class MessageEntity extends BaseEntity {
  @Column({
    type: 'uuid',
    name: 'conversation_id',
    comment: '会话ID',
  })
  conversationId: string;

  @Column({
    type: 'uuid',
    name: 'sender_id',
    comment: '发送者Id',
  })
  senderId: string;

  @Column({
    type: 'uuid',
    name: 'reply_to',
    nullable: true,
    comment: '被回复的消息ID',
  })
  replyTo?: string;

  @Column({
    type: 'tinyint',
    default: MessageType.TEXT,
    comment: '消息类型',
    nullable: true,
  })
  type: MessageType;

  @Column({
    type: 'tinyint',
    default: MessageStatus.NORMAL,
    comment: '消息状态',
    nullable: true,
  })
  status: MessageStatus;

  @Column({
    type: 'text',
    comment: '消息内容',
    nullable: true,
  })
  content?: string;

  @Column({
    type: 'bigint',
    comment: '递增序列号',
    transformer: {
      to: (value: number) => value.toString(), // 将数字存储为字符串
      from: (value: string) => Number(value), // 从字符串转换为数字
    },
  })
  seq: number;

  @Column({
    type: 'json',
    nullable: true,
    comment: '补充内容',
  })
  metadata?: Record<string, any>;
}
