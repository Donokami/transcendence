import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { SocketIoAdapter } from '@/core/websockets/auth-adapter';
import * as express from 'express';

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config({ path: '../envs/.env' });

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  app.enableCors({
    allowedHeaders: ['content-type'],
    origin: configService.get('FRONTEND_URL'),
    credentials: true,
  });

  app.useWebSocketAdapter(new SocketIoAdapter(app, configService));

  app.setGlobalPrefix('api');

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  const config = new DocumentBuilder()
    .setTitle('Transcendence API')
    .setDescription('Transcendence API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(configService.get('PORT'));
}
bootstrap();
