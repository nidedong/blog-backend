import { UserService } from './../services/user.service';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { StrategyEnum } from 'shared/enums';
import { Strategy } from 'passport-github2';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariable } from 'shared/interfaces';
import { IGithubAuthData } from 'user/interfaces';

@Injectable()
export class GithubStrategy extends PassportStrategy(
  Strategy,
  StrategyEnum.Github,
) {
  constructor(
    private readonly configService: ConfigService<EnvironmentVariable>,
    private readonly userService: UserService,
  ) {
    super({
      clientID: configService.get('auth', { infer: true }).githubClientId,
      clientSecret: configService.get('auth', { infer: true })
        .githubClientSecret,
      callbackURL: configService.get('auth', { infer: true })
        .githubAuthCallbackUrl,
      scope: ['public_profile'],
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: IGithubAuthData,
  ) {
    const authInfo = {
      ...profile,
      accessToken,
      refreshToken,
    };
    return this.userService.validateByGithub(authInfo);
  }
}
