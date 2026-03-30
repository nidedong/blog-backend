import { forwardRef, Module } from '@nestjs/common';
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
import { FriendEntity } from './entities/friend.entity';
import { FriendRequestEntity } from './entities/friend.request.entity';
import { FriendController } from './controllers/friend.controller';
import { FriendService } from './services/friend.service';
import { AuthController } from './controllers/auth.controller';
import { SocketModule } from 'socket/socket.module';
import { ChatModule } from 'chat/chat.module';
import { UserPresenceListener } from './listeners/user.presence.listener';
import { FriendRequestListener } from './listeners/friend.request.listener';
import { GetProfileUseCase } from './usecases/get-profile.uc';
import { NotifyModule } from 'notify/notify.module';

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
    TypeOrmModule.forFeature([UserEntity, FriendEntity, FriendRequestEntity]),
    SocketModule,
    forwardRef(() => ChatModule),
    forwardRef(() => NotifyModule),
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
    // 用户在线状态监听
    UserPresenceListener,
    FriendRequestListener,
    // uc
    GetProfileUseCase,
  ],
  controllers: [
    AuthController,
    UserController,
    CaptchaController,
    FriendController,
  ],
  exports: [UserService, UserRepository, FriendService, ProfileService],
})
export class UserModule {}
