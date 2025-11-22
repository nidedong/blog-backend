import { BaseEntity } from 'shared/entities/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { NotificationBroadCastEntity } from './notification_broadcast.entity';

@Entity('notification_user')
export class NotificationUserEntity extends BaseEntity {
  @ManyToOne(() => NotificationBroadCastEntity)
  @JoinColumn({ name: 'broadcastId' })
  notification: NotificationBroadCastEntity;

  @Column('uuid')
  broadcastId: string;

  @Column('uuid')
  userId: string;

  @Column({ default: false, nullable: true, type: 'boolean' })
  isRead: boolean;

  @Column({ nullable: true, name: 'read_at', type: 'date' })
  readAt?: Date;

  @Column({
    default: false,
    nullable: true,
    comment: '是否已推送',
    type: 'boolean',
  })
  delivered: boolean;
}
