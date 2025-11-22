import { NotificationType } from 'notify/interfaces';
import { BaseFixEntity } from 'shared/entities/base.fix.entity';
import { Column, Entity } from 'typeorm';

@Entity('notification_broadcast')
export class NotificationBroadCastEntity extends BaseFixEntity {
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column('text')
  content: string;

  @Column({
    type: 'tinyint',
    default: NotificationType.SYSTEM,
    nullable: true,
  })
  type?: NotificationType;

  @Column('json', { nullable: true })
  metadata?: Record<string, any>;

  @Column('uuid', { nullable: true, name: 'sender_id' })
  senderId?: string;
}
