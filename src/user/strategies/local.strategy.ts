import { UserService } from './../services/user.service';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { StrategyEnum } from 'shared/enums';
import { Strategy } from 'passport-local';

@Injectable()
export class LocalStrategy extends PassportStrategy(
  Strategy,
  StrategyEnum.Local,
) {
  constructor(private readonly userService: UserService) {
    super({
      usernameField: 'email',
    });
  }

  validate(email: string, password: string) {
    return this.userService.validateUser(email, password);
  }
}
