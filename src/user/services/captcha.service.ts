import { Injectable } from '@nestjs/common';
import { RedisPrefix } from 'shared/common';
import { ApiException } from 'shared/exception';
import { MailService } from 'shared/services/mail/mail.services';
import { RedisService } from 'shared/services/redis/redis.service';
import { VerificationCodeDto } from 'user/dtos/verification.code.dto';
import { UserRepository } from 'user/repositories/user.repository';

@Injectable()
export class CaptchaService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly redisService: RedisService,
    private readonly mailService: MailService,
  ) {}

  createCaptcha() {
    return Math.floor(1000 + Math.random() * 9000) + '';
  }

  async sendRegisterCaptcha(verificationInfo: VerificationCodeDto) {
    const captcha = this.createCaptcha();

    await this.mailService.sendRegisterCaptcha(verificationInfo.email, captcha);

    await this.redisService.set(
      RedisService.gk(RedisPrefix.RegisterCaptcha, verificationInfo.email),
      captcha,
      60 * 5,
    );
  }

  async sendLoginCaptcha(verificationInfo: VerificationCodeDto) {
    const user = await this.userRepo.findOneBy({
      email: verificationInfo.email,
    });

    if (!user) {
      throw ApiException.tipError('user.user_not_exist');
    }

    const captcha = this.createCaptcha();

    await this.mailService.sendLoginCaptcha(verificationInfo.email, captcha);

    await this.redisService.set(
      RedisService.gk(RedisPrefix.LoginCaptcha, verificationInfo.email),
      captcha,
      60 * 5,
    );
  }

  async sendChangepasswordCaptcha(
    userId: string,
    verificationInfo: VerificationCodeDto,
  ) {
    const captcha = this.createCaptcha();

    const user = await this.userRepo.findOneBy({
      id: userId,
    });

    if (!user) {
      throw ApiException.tipError('user.user_not_exist');
    }

    await this.mailService.sendResetPasswordCaptcha(verificationInfo.email, {
      captcha,
      userName: user.nickName,
    });

    await this.redisService.set(
      RedisService.gk(
        RedisPrefix.ChangePasswordCaptcha,
        verificationInfo.email,
      ),
      captcha,
      60 * 5,
    );
  }
}
