import { PickType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create.user.dto';

export class ForgetPasswordDto extends PickType(CreateUserDto, [
  'password',
  'captcha',
  'email',
]) {}
