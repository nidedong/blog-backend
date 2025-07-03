import { PickType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create.user.dto';

export class LoginByEmailDto extends PickType(CreateUserDto, [
  'email',
  'password',
]) {}
