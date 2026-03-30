import { PickType } from '@nestjs/mapped-types';
import { CreateUserDto } from '../auth/create.user.dto';

export class LoginByEmailDto extends PickType(CreateUserDto, [
  'email',
  'password',
]) {}
