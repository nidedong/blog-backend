import { BaseEntity } from 'shared/entities/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { FriendReqStatus } from 'user/interfaces';
import { UserEntity } from './user.entity';

@Entity('friend_request')
export class FriendRequestEntity extends BaseEntity {
  @Column({
    type: 'uuid',
    name: 'sender_id',
  })
  senderId: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({
    name: 'sender_id',
  })
  sender;

  @Column({
    type: 'uuid',
    name: 'receiver_id',
  })
  receiverId: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({
    name: 'receiver_id',
  })
  receiver;

  @Column({
    type: 'varchar',
    width: 255,
    default: null,
    nullable: true,
  })
  message?: string;

  @Column({
    type: 'tinyint',
    default: FriendReqStatus.Waiting,
  })
  status: FriendReqStatus;
}
