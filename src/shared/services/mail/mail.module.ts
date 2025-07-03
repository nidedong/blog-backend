import { Module } from '@nestjs/common';
import { MailConfigurableModuleClass } from './mail.module.builder';
import { MailService } from './mail.services';

@Module({
  providers: [MailService],
  exports: [MailService],
})
export class MailModule extends MailConfigurableModuleClass {}
