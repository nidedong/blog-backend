import { PickType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create.user.dto';

export class LoginByCaptchaDto extends PickType(CreateUserDto, [
  'email',
  'captcha',
]) {}
