import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { LoggerService } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariable } from 'shared/interfaces';
import { environment } from 'app.environment';
import { initSwagger } from 'init';
import { I18nValidationPipe } from 'nestjs-i18n';
import * as CookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const appConfig = app
    .get(ConfigService<EnvironmentVariable>)
    .get('app', { infer: true });

  const logger = app.get<LoggerService>(WINSTON_MODULE_NEST_PROVIDER);

  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  initSwagger(app);

  app.useStaticAssets('public', { prefix: '/static' });

  app.setGlobalPrefix(appConfig.prefix);

  app.enableCors();

  app.use(CookieParser());

  app.useGlobalPipes(
    new I18nValidationPipe({
      transform: true,
      // 不生效
      stopAtFirstError: true,
    }),
  );

  await app.listen(appConfig.port, appConfig.address);

  // print running environment
  logger.log(`Application[${appConfig.name}]-Env[${environment}]`, 'Bootstrap');
  // print server info
  logger.log(
    `The service is running, please visit it: [ ${await app.getUrl()} ]`,
    'Bootstrap',
  );
}
bootstrap();
