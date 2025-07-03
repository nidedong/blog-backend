import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariable } from 'shared/interfaces';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

export interface MailModuleOptionsFactory {
  createMailOptions(): SMTPTransport.Options;
}

@Injectable()
export class MailConfigService implements MailModuleOptionsFactory {
  @Inject(ConfigService)
  configService: ConfigService<EnvironmentVariable>;

  createMailOptions(): SMTPTransport.Options {
    const envMailConfig = this.configService.get('mail', { infer: true });

    return {
      host: envMailConfig.host,
      port: envMailConfig.port,
      secure: envMailConfig.secure,
      auth: {
        user: envMailConfig.authUser,
        pass: envMailConfig.authPass,
      },
    };
  }
}
