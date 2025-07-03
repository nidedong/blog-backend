import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CookieResolver,
  HeaderResolver,
  QueryResolver,
  AcceptLanguageResolver,
  I18nModule,
} from 'nestjs-i18n';
import { EnvironmentVariable } from 'shared/interfaces';
import { join } from 'path';

@Module({
  imports: [
    I18nModule.forRootAsync({
      useFactory: (configService: ConfigService<EnvironmentVariable>) => ({
        fallbackLanguage: configService.getOrThrow('app.language', {
          infer: true,
        }),
        loaderOptions: {
          path: join(__dirname, '../../../i18n/'),
          watch: true,
        },
        typesOutputPath: join(
          __dirname,
          '../../../../src/generated/i18n.generated.ts',
        ),
      }),
      resolvers: [
        new QueryResolver(['lang', 'l']),
        new HeaderResolver(['x-custom-lang']),
        new CookieResolver(),
        AcceptLanguageResolver,
      ],
      inject: [ConfigService],
    }),
  ],
})
export class I18nConfigModule {}
