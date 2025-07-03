import { ConfigurableModuleBuilder } from '@nestjs/common';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

export const {
  ConfigurableModuleClass: MailConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN: MAIL_MODULE_OPTIONS_TOKEN,
} = new ConfigurableModuleBuilder<SMTPTransport.Options>()
  .setFactoryMethodName('createMailOptions')
  .build();
