import { Expose } from 'class-transformer';
import { UserVo } from './user.vo';
import { FriendStatus } from 'user/interfaces/friend.interface';

export class FriendVo extends UserVo {
  @Expose()
  status: FriendStatus;
}
