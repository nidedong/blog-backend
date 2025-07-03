import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { StrategyEnum } from 'shared/enums';
import { Strategy } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariable } from 'shared/interfaces';

@Injectable()
export class GoogleStrategy extends PassportStrategy(
  Strategy,
  StrategyEnum.Google,
) {
  constructor(
    private readonly configService: ConfigService<EnvironmentVariable>,
  ) {
    super({
      clientID: configService.get('auth', { infer: true }).googleClientId,
      clientSecret: configService.get('auth', { infer: true })
        .googleClientSecret,
      callbackURL: configService.get('auth', { infer: true })
        .googleAuthCallbackUrl,
      scope: ['email', 'profile'],
    });
  }

  validate(accessToken: string, refreshToken: string, profile: any) {
    return {
      ...profile,
      accessToken,
      refreshToken,
    };
  }
}
