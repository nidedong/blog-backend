import { PickType } from '@nestjs/mapped-types';
import { CreateUserDto } from '../auth/create.user.dto';

export class UpdateUserDto extends PickType(CreateUserDto, [
  'avatar',
  'gender',
  'remark',
  'mobilePhone',
  'nickName',
]) {}
