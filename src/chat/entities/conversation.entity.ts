import { BaseEntity } from 'shared/entities/base.entity';
import { ConversationType } from '../interfaces';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { ConversationMemberEntity } from './conversation_member.entity';
import { MessageEntity } from './message.entity';

@Entity('conversation')
@Index('idx_type', ['type'])
export class ConversationEntity extends BaseEntity {
  @Column({
    type: 'tinyint',
    width: 1,
    default: ConversationType.PRIVATE,
  })
  type: ConversationType;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  title?: string;

  @Column({
    type: 'uuid',
    nullable: true,
    name: 'last_message_id',
  })
  lastMessageId?: string;

  @OneToOne(() => MessageEntity)
  @JoinColumn({
    name: 'last_message_id',
  })
  lastMessage?: MessageEntity;

  @Column({
    type: 'bigint',
    transformer: {
      to: (value: number) => value.toString(), // 将数字存储为字符串
      from: (value: string) => Number(value), // 从字符串转换为数字
    },
    name: 'last_message_seq',
  })
  lastMessageSeq: number;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    name: 'p2p_key',
    comment: '私聊唯一索引',
    unique: true,
  })
  p2pKey?: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  avatar?: string;

  // 元数据
  @Column({
    type: 'json',
    nullable: true,
  })
  metadata?: Record<string, any>;

  @OneToMany(() => ConversationMemberEntity, (m) => m.conversation)
  members: ConversationMemberEntity[];
}
