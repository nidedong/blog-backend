import { Controller, Get, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { IsPublic } from 'shared/decorator';
import { VerificationCodeDto } from 'user/dtos/verification.code.dto';
import { CaptchaService } from 'user/services/captcha.service';

@Controller('captcha')
export class CaptchaController {
  constructor(private readonly captchaService: CaptchaService) {}

  @IsPublic()
  @Get('/register')
  sendRegisterCaptcha(@Query() verificationInfo: VerificationCodeDto) {
    return this.captchaService.sendRegisterCaptcha(verificationInfo);
  }

  @IsPublic()
  @Get('/login')
  sendLoginCaptcha(@Query() verificationInfo: VerificationCodeDto) {
    return this.captchaService.sendLoginCaptcha(verificationInfo);
  }

  @Get('/changepassword')
  sendChangepasswordCaptcha(
    @Query() verificationInfo: VerificationCodeDto,
    @Req() request: Request,
  ) {
    return this.captchaService.sendChangepasswordCaptcha(
      request.user.id,
      verificationInfo,
    );
  }
}
