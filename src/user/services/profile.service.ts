import { Injectable } from '@nestjs/common';
import { RedisKeys, RedisPrefix } from 'shared/common';
import { ApiException } from 'shared/exception';
import { RedisService } from 'shared/services/redis/redis.service';
import { ChangePasswordDto } from 'user/dtos/user/changepassord.dto';
import { UserRepository } from 'user/repositories/user.repository';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from 'user/dtos/user/update.user.dto';
import { In } from 'typeorm';
import { UserEntity } from 'user/entities/user.entity';
import { keyBy } from 'lodash';

@Injectable()
export class ProfileService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly redisService: RedisService,
  ) {}

  async ensureGetProfiles(userIds: string[]) {
    const caches = await this.redisService.safeMget(
      userIds.map((id) => RedisKeys.userProfile(id)),
    );

    const missIds: string[] = [];
    let userMap: Record<string, UserEntity> = {};

    caches.forEach((cache, index) => {
      if (cache === null) {
        missIds.push(userIds[index]);
      } else {
        userMap[userIds[index]] = JSON.parse(cache);
      }
    });

    if (missIds.length > 0) {
      const users = await this.userRepo.findBy({
        id: In(missIds),
      });

      await this.redisService
        .getClient()
        .mset(
          ...users.flatMap((u) => [
            RedisKeys.userProfile(u.id),
            JSON.stringify(u),
          ]),
        );

      userMap = {
        ...userMap,
        ...keyBy(users, 'id'),
      };
    }

    return userIds.map((userId) => userMap[userId]);
  }

  async updateProfile(userId: string, dto: UpdateUserDto) {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) {
      throw ApiException.tipError('user.user_not_exist');
    }
    user.avatar = dto.avatar;
    user.gender = dto.gender;
    user.mobilePhone = dto.mobilePhone;
    user.remark = dto.remark;
    user.nickName = dto.nickName;
    await this.userRepo.save(user);
  }

  async changePasswrod(userId: string, dto: ChangePasswordDto) {
    const user = await this.userRepo.findOneBy({
      id: userId,
    });

    if (!user) {
      throw ApiException.tipError('user.user_not_exist');
    }

    const reidsKey = RedisService.gk(
      RedisPrefix.ChangePasswordCaptcha,
      user.email,
    );

    const captcha = await this.redisService.get(reidsKey);

    if (!captcha) {
      throw ApiException.tipError('tip.api_verification_code_expire');
    }

    if (+captcha !== +dto.captcha) {
      throw ApiException.tipError('tip.api_verification_code_error');
    }

    const newPassword = await bcrypt.hash(dto.password, 12);

    await this.userRepo.update(userId, {
      password: newPassword,
    });

    this.redisService.del(reidsKey);
  }
}
