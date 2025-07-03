import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { StrategyEnum } from 'shared/enums';
import { Strategy, ExtractJwt } from 'passport-jwt';
import type { JwtUserData } from 'typing';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariable } from 'shared/interfaces';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, StrategyEnum.Jwt) {
  constructor(
    private readonly configService: ConfigService<EnvironmentVariable>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('auth', { infer: true }).jwtSecret,
      // 过期不报错
      ignoreExpiration: true,
    });
  }

  validate(payload: JwtUserData) {
    return payload;
  }
}
