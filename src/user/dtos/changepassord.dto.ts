import { PickType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create.user.dto';

export class ChangePasswordDto extends PickType(CreateUserDto, [
  'password',
  'captcha',
]) {}
