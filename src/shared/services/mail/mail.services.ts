import { ConfigService } from '@nestjs/config';
import { Inject, Injectable } from '@nestjs/common';
import { MAIL_MODULE_OPTIONS_TOKEN } from './mail.module.builder';
import { createTransport, Transporter } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { EnvironmentVariable } from 'shared/interfaces';
import { render } from '@react-email/components';
import RegisterCaptchaEmail from './templates/register-captcha';
import ResetPasswordEmail from './templates/reset-password-captcha';

@Injectable()
export class MailService {
  private readonly transport: Transporter;

  constructor(
    @Inject(MAIL_MODULE_OPTIONS_TOKEN) options: SMTPTransport.Options,
    private readonly configService: ConfigService<EnvironmentVariable>,
  ) {
    this.transport = createTransport(options);
  }

  async sendRegisterCaptcha(email: string, captcha: string) {
    const supportEmail = this.configService.get('mail', {
      infer: true,
    }).authUser;
    const companyName = this.configService.get('app', { infer: true }).name;

    const html = await render(
      RegisterCaptchaEmail({
        captcha,
        supportEmail,
        companyName,
      }),
    );

    return this.transport.sendMail({
      from: {
        name: 'dbb博客系统邮件',
        address: this.configService.get('mail', { infer: true }).authUser,
      },
      subject: '注册验证码',
      to: email,
      html,
    });
  }

  async sendResetPasswordCaptcha(
    email: string,
    context: {
      captcha: string;
      userName: string;
    },
  ) {
    const supportEmail = this.configService.get('mail', {
      infer: true,
    }).authUser;
    const companyName = this.configService.get('app', { infer: true }).name;

    const html = await render(
      ResetPasswordEmail({
        captcha: context.captcha,
        supportEmail,
        companyName,
        userName: context.userName,
      }),
    );

    return this.transport.sendMail({
      from: {
        name: 'dbb博客系统邮件',
        address: this.configService.get('mail', { infer: true }).authUser,
      },
      subject: '重置密码',
      to: email,
      html,
    });
  }
}
