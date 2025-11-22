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
import { NotificationUserEntity } from 'notify/entities/notification_user.entity';
import { FriendEntity } from './entities/friend.entity';
import { FriendRequestEntity } from './entities/friend.request.entity';
import { FriendController } from './controllers/friend.controller';
import { FriendService } from './services/friend.service';
import { AuthController } from './controllers/auth.controller';
import { SocketModule } from 'socket/socket.module';

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
    TypeOrmModule.forFeature([
      UserEntity,
      NotificationUserEntity,
      FriendEntity,
      FriendRequestEntity,
    ]),
    SocketModule,
  ],
  providers: [
    UserService,
    CaptchaService,
    ProfileService,
    FriendService,
    UserRepository,
    LocalStrategy,
    JwtStrategy,
    GoogleStrategy,
    GithubStrategy,
  ],
  controllers: [
    AuthController,
    UserController,
    CaptchaController,
    FriendController,
  ],
  exports: [UserService, UserRepository],
})
export class UserModule {}
