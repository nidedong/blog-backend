import { Module } from '@nestjs/common';
import { UserService } from './services/user.service';
import { UserController } from './controllers/user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from './repositories/user.repository';
import { UserEntity } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariable } from 'shared/interfaces';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { GithubStrategy } from './strategies/github.strategy';
import { CaptchaController } from './controllers/captcha.controller';
import { CaptchaService } from './services/captcha.service';
import { ProfileService } from './services/profile.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory(configService: ConfigService<EnvironmentVariable>) {
        const authConfig = configService.get('auth', { infer: true });
        return {
          secret: authConfig.jwtSecret,
          signOptions: {
            expiresIn: authConfig.jwtExpiresIn,
          },
        };
      },
    }),
    TypeOrmModule.forFeature([UserEntity]),
  ],
  providers: [
    UserService,
    CaptchaService,
    ProfileService,
    UserRepository,
    LocalStrategy,
    JwtStrategy,
    GoogleStrategy,
    GithubStrategy,
  ],
  controllers: [UserController, CaptchaController],
  exports: [UserService, UserRepository],
})
export class UserModule {}
