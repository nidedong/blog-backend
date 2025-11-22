import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { RedisIoAdapter } from 'shared/adapter/redis-io.adapter';

export const initSwagger = (app: INestApplication) => {
  const config = new DocumentBuilder()
    .setTitle('BLOG API')
    .setDescription('BLOG API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/nest/v1/docs', app, document);
  return app;
};

// initSentry

export const initRedisIoAdapter = (app: INestApplication) => {
  app.useWebSocketAdapter(new RedisIoAdapter(app));
  return app;
};
