import { RedisService } from 'shared/services/redis/redis.service';
import { ApiException } from 'shared/exception/api.exception';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { BasePaginatedParamsDto } from 'shared/dtos/base.paginated.params.dto';
import { RegisterType, SorterEnum } from 'shared/interfaces';
import { JwtUserData } from 'typing';
import { CreateUserDto } from '../dtos/create.user.dto';
import { UserEntity } from '../entities/user.entity';
import { IGithubAuthData } from '../interfaces';
import { UserRepository } from '../repositories/user.repository';
import { RedisPrefix } from 'shared/common';
import * as bcrypt from 'bcrypt';
import { MailService } from 'shared/services/mail/mail.services';
import { LoginByCaptchaDto } from 'user/dtos/login.captcha.dto';
import { getRandomLetters } from 'shared/helpers/encrypt';
import { ForgetPasswordDto } from 'user/dtos/forgetpassword.dto';
import { SearchUserParamsDto } from 'user/dtos/search.user.dto';
import { Like, Not } from 'typeorm';
import { FriendEntity } from 'user/entities/friend.entity';
import { FriendRequestEntity } from 'user/entities/friend.request.entity';

@Injectable()
export class UserService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepo: UserRepository,
    private readonly redisService: RedisService,
    private readonly mailService: MailService,
  ) {}

  async createUserByEmail(user: CreateUserDto) {
    const exist = await this.userRepo.existsBy({
      email: user.email,
    });

    if (exist) {
      throw ApiException.tipError('user.user_already_exist');
    }

    const redisKey = RedisService.gk(RedisPrefix.RegisterCaptcha, user.email);

    const captcha = await this.redisService.get(redisKey);

    if (!captcha) {
      throw ApiException.tipError('tip.api_verification_code_expire');
    }

    if (+captcha !== +user.captcha) {
      throw ApiException.tipError('tip.api_verification_code_error');
    }

    const userEntity = new UserEntity();
    userEntity.nickName = user.nickName;
    userEntity.avatar = user.avatar;
    userEntity.email = user.email;
    userEntity.gender = user.gender;
    userEntity.remark = user.remark;
    userEntity.avatar = user.avatar;
    userEntity.registerType = RegisterType.EMAIL;

    if (!userEntity.nickName) {
      userEntity.nickName = `${getRandomLetters(5)}_${new Date().getTime()}`;
    }

    userEntity.password = await bcrypt.hash(user.password, 12);

    await this.userRepo.insertByEntity(userEntity);

    await this.redisService.del(redisKey);
  }

  async forgetpassword(dto: ForgetPasswordDto) {
    const user = await this.userRepo.findOneBy({
      email: dto.email,
    });

    if (!user) {
      throw ApiException.tipError('user.user_not_exist');
    }

    const redisKey = RedisService.gk(
      RedisPrefix.ForgetPasswordCaptcha,
      user.email,
    );

    const captcha = await this.redisService.get(redisKey);

    if (!captcha) {
      throw ApiException.tipError('tip.api_verification_code_expire');
    }

    if (+captcha !== +dto.captcha) {
      throw ApiException.tipError('tip.api_verification_code_error');
    }

    user.password = await bcrypt.hash(dto.password, 12);

    await this.userRepo.save(user);
  }

  async createUserByGithubInfo(authInfo: IGithubAuthData) {
    const userEntity = new UserEntity();
    userEntity.githubId = authInfo.id;
    userEntity.nickName = authInfo.username;
    userEntity.registerType = RegisterType.GITHUB;
    return this.userRepo.saveByEntity(userEntity);
  }

  async selectUserBaseInfoById(userId: string) {
    return this.userRepo.selectUserBaseInfoById(userId);
  }

  async logout(userId: string) {
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
    await this.redisService.del(RedisService.gk(RedisPrefix.Token, user.id));
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

  async validateByCaptcha(dto: LoginByCaptchaDto) {
    const user = await this.userRepo.findOneBy({
      email: dto.email,
    });

    if (!user) {
      throw ApiException.tipError('user.user_not_exist');
    }

    const redisKey = RedisService.gk(RedisPrefix.LoginCaptcha, user.email);

    const captcha = await this.redisService.get(redisKey);

    if (+captcha === +dto.captcha) {
      await this.redisService.del(redisKey);
      return this.selectJwtUserDataFromEntity(user);
    }

    throw ApiException.tipError('tip.api_verification_code_error');
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

  async refreshToken(
    userInfo: JwtUserData,
    accessToken: string | undefined,
  ): Promise<JwtUserData | undefined> {
    if (!userInfo || !userInfo.id || !accessToken) return;
    const memoAccessToken = await this.redisService.get(
      RedisService.gk(RedisPrefix.Token, userInfo.id),
    );

    if (memoAccessToken && memoAccessToken === accessToken) {
      const refreshToken = await this.createToken(userInfo);
      return {
        ...userInfo,
        refreshToken,
      };
    } else {
      return;
    }
  }

  async searchUsers(userId: string, dto: SearchUserParamsDto) {
    const where: Record<string, any> = {};

    if (dto.keyword) {
      where.nickName = Like(`%${dto.keyword}%`);
    }

    const [list, total] = await this.userRepo.findAndCount({
      where: {
        ...where,
        id: Not(userId),
      },
      skip: dto.start,
      take: dto.end - dto.start + 1,
      order: {
        lastLoginTime: dto.order,
      },
    });

    return {
      list,
      total,
    };
  }

  async searchNoRelationUsers(userId: string, dto: SearchUserParamsDto) {
    const [list, total] = await this.userRepo
      .createQueryBuilder('u')
      // 排除自己
      .where('u.id != :userId')
      // 搜索昵称
      .andWhere('u.nickName LIKE :keyword')
      // 排除好友
      .leftJoin(
        FriendEntity,
        'f',
        'f.userId = :userId AND f.friendId = u.id OR f.userId = u.id AND f.friendId = :userId',
      )
      .andWhere('f.id IS NULL')
      // 排除好友请求
      .leftJoin(
        FriendRequestEntity,
        'fr',
        'fr.senderId = :userId AND fr.receiverId = u.id',
      )
      .andWhere('fr.id IS NULL')
      .setParameters({
        userId,
        keyword: `%${dto.keyword}%`,
      })
      .orderBy(
        'u.lastLoginTime',
        dto.order === SorterEnum.DESC ? 'DESC' : 'ASC',
      )
      .addOrderBy('u.id', dto.order === SorterEnum.DESC ? 'DESC' : 'ASC')
      .skip(dto.start)
      .take(dto.end - dto.start + 1)
      .getManyAndCount();

    return {
      list,
      total,
    };
  }

  async createTestData() {
    const users = [];

    for (let i = 1; i <= 100; i++) {
      users.push(
        this.userRepo.create({
          nickName: `User${i}`,
          mobilePhone: `1380000${String(i).padStart(4, '0')}`,
          email: `user${i}@example.com`,
          password:
            '$2b$12$cQHT7DRtxjEO/iSAHQ5ONeUlbb2yLioQthYY4UhRuZv9ksv5GaY5W',
          gender: i % 2 === 0 ? 1 : 0,
          remark: `This is user ${i}`,
          lastLoginTime: new Date(),
          locale: 'en-US',
          githubId: null,
          registerType: 0,
          isOnline: false,
        }),
      );
    }

    await this.userRepo.save(users);
  }
}
