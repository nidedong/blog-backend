import { BaseEntity } from 'shared/entities/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { FriendStatus } from 'user/interfaces';
import { UserEntity } from './user.entity';

@Entity('friend')
export class FriendEntity extends BaseEntity {
  @Column({
    nullable: true,
    type: 'uuid',
    name: 'user_id',
  })
  userId: string;

  @Column({
    nullable: true,
    type: 'uuid',
    name: 'friend_id',
  })
  friendId: string;

  @Column({
    type: 'tinyint',
    default: FriendStatus.Normal,
  })
  status: FriendStatus;

  @ManyToOne(() => UserEntity)
  @JoinColumn({
    name: 'friend_id',
  })
  friend: UserEntity;
}
