import { BaseEntity } from 'shared/entities/base.entity';
import { ConversationType } from '../interfaces';
import { Column, Entity, Index } from 'typeorm';

@Entity('conversation')
@Index('idx_type', ['type'])
export class ConversationEntity extends BaseEntity {
  @Column({
    type: 'enum',
    default: ConversationType.PRIVATE,
    enum: ConversationType,
  })
  type: ConversationType;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  title?: string;

  // 群头像等元数据
  @Column({
    type: 'json',
    nullable: true,
  })
  metadata?: Record<string, any>;
}
