import { PickType } from '@nestjs/mapped-types';
import { CreateUserDto } from '../auth/create.user.dto';

export class VerificationCodeDto extends PickType(CreateUserDto, ['email']) {}
