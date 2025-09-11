import { Injectable } from '@nestjs/common';
import { RedisPrefix } from 'shared/common';
import { ApiException } from 'shared/exception';
import { RedisService } from 'shared/services/redis/redis.service';
import { ChangePasswordDto } from 'user/dtos/changepassord.dto';
import { UserRepository } from 'user/repositories/user.repository';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from 'user/dtos/update.user.dto';

@Injectable()
export class ProfileService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly redisService: RedisService,
  ) {}

  async getProfile(userId: string) {
    const user = await this.userRepo.selectUserBaseInfoById(userId);

    if (!user) {
      throw ApiException.tipError('user.user_not_exist');
    }

    return user;
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
