import { Module, ValidationPipe, MiddlewareConsumer } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '@/modules/auth/auth.module';
import { ChannelsModule } from '@/modules/channels/channels.module';
import { ChatModule } from '@/modules/chat/chat.module';
import { SocialModule } from '@/modules/social/social.module';
import { GameModule } from '@/modules/game/game.module';
import { UsersModule } from '@/modules/users/users.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import config from './core/config';
import { TypeOrmConfigService } from './core/config/database.config';
import { RequestHandler } from 'express';

// eslint-disable-next-line @typescript-eslint/no-var-requires
export const session: RequestHandler = require('cookie-session')({
  name: 'session',
  keys: ['cookieString'],
});

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    ChannelsModule,
    ChatModule,
    SocialModule,
    GameModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
      }),
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(session).forRoutes('*');
  }
}
