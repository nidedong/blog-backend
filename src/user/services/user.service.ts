import { RedisService } from 'shared/services/redis/redis.service';
import { ApiException } from 'shared/exception/api.exception';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { BasePaginatedParamsDto } from 'shared/dtos/base.paginated.params.dto';
import { RegisterType } from 'shared/interfaces';
import { JwtUserData } from 'typing';
import { CreateUserDto } from '../dtos/create.user.dto';
import { UserEntity } from '../entities/user.entity';
import { IGithubAuthData } from '../interfaces';
import { UserRepository } from '../repositories/user.repository';
import { RedisPrefix } from 'shared/common';
import * as bcrypt from 'bcrypt';
import { VerificationCodeDto } from '../dtos/verification.code.dto';
import { MailService } from 'shared/services/mail/mail.services';

@Injectable()
export class UserService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepo: UserRepository,
    private readonly redisService: RedisService,
    private readonly mailService: MailService,
  ) {}

  async sendVerificationCode(verificationInfo: VerificationCodeDto) {
    const captcha = Math.floor(Math.random() * 10000) + '';

    await this.mailService.sendRegisterCaptcha(verificationInfo.email, captcha);

    await this.redisService.set(
      RedisService.gk(RedisPrefix.Captcha, verificationInfo.email),
      captcha,
      60 * 5,
    );
  }

  async createUserByEmail(user: CreateUserDto) {
    const exist = await this.userRepo.existsBy({
      email: user.email,
    });

    if (exist) {
      throw ApiException.tipError('user.user_already_exist');
    }

    const redisKey = RedisService.gk(RedisPrefix.Captcha, user.email);

    const captcha = await this.redisService.get(redisKey);

    if (!captcha) {
      throw ApiException.tipError('tip.api_verification_code_expire');
    }

    if (+captcha !== +user.captcha) {
      throw ApiException.tipError('tip.api_verification_code_error');
    }

    const userEntity = new UserEntity();
    userEntity.nikeName = user.nikeName;
    userEntity.avatar = user.avatar;
    userEntity.email = user.email;
    userEntity.gender = user.gender;
    userEntity.remark = user.remark;
    userEntity.avatar = user.avatar;
    userEntity.registerType = RegisterType.EMAIL;

    userEntity.password = await bcrypt.hash(user.password, 12);

    await this.userRepo.insertByEntity(userEntity);

    this.redisService.del(redisKey);
  }

  async createUserByGithubInfo(authInfo: IGithubAuthData) {
    const userEntity = new UserEntity();
    userEntity.githubId = authInfo.id;
    userEntity.nikeName = authInfo.username;
    userEntity.registerType = RegisterType.GITHUB;
    return this.userRepo.saveByEntity(userEntity);
  }

  async selectUserBaseInfoById(userId: string) {
    return this.userRepo.selectUserBaseInfoById(userId);
  }

  async logoff(userId: string) {
    const user = await this.userRepo.findOne({
      where: {
        id: userId,
      },
      withDeleted: true,
    });
    if (!user) {
      throw ApiException.tipError('user.user_not_exist');
    }

    if (user.deleteAt) {
      throw ApiException.tipError('user.user_already_deleted');
    }

    await this.redisService.del(RedisService.gk(RedisPrefix.Token, userId));

    this.userRepo.softDelete(userId);
  }

  async selectUserByPagination(params: BasePaginatedParamsDto) {
    return this.userRepo.selectUserByPagination(params);
  }

  async selectJwtUserDataFromEntity(user: UserEntity) {
    const userInfo: JwtUserData = {
      id: user.id,
      lastLoginTime: user.lastLoginTime,
      registerType: user.registerType,
    };

    return userInfo;
  }

  async validateUser(email: string, password: string) {
    const user = await this.userRepo.selectUserInfoByEmail(email);
    if (!user) {
      throw ApiException.tipError('user.user_not_exist');
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      throw ApiException.tipError('user.user_password_error');
    }

    return this.selectJwtUserDataFromEntity(user);
  }

  async validateByGithub(authInfo: IGithubAuthData) {
    if (!authInfo?.id) {
      throw ApiException.tipError('user.user_github_info_miss');
    }

    const user = await this.userRepo.findOneBy({
      githubId: authInfo.id,
    });

    if (user) {
      return this.selectJwtUserDataFromEntity(user);
    } else {
      return this.selectJwtUserDataFromEntity(
        await this.createUserByGithubInfo(authInfo),
      );
    }
  }

  async createToken(userInfo: JwtUserData) {
    const token = this.jwtService.sign(userInfo);
    await this.redisService.set(
      RedisService.gk(RedisPrefix.Token, userInfo.id),
      token,
      // 七天
      7 * 24 * 60 * 60,
    );

    return token;
  }

  async refreshToken(userInfo: JwtUserData): Promise<JwtUserData | undefined> {
    if (!userInfo || !userInfo.id) return;
    const accessToken = await this.redisService.get(
      RedisService.gk(RedisPrefix.Token, userInfo.id),
    );

    if (accessToken) {
      const refreshToken = await this.createToken(userInfo);
      return {
        ...userInfo,
        refreshToken,
      };
    } else {
      return;
    }
  }
}
