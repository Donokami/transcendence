import { Module, ValidationPipe, MiddlewareConsumer } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ChannelsModule } from '@/modules/channels/channels.module';

import { ChatModule } from '@/modules/chat/chat.module';

import { GameModule } from '@/modules/game/game.module';

import { UsersModule } from '@/modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UserSerializer } from '@/modules/auth/user.serializer';

import config from './core/config';
import { TypeOrmConfigService } from './core/config/database.config';
import { RequestHandler } from 'express';
import * as passport from 'passport';

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
    GameModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    UserSerializer,
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
    consumer.apply(passport.initialize(), passport.session()).forRoutes('*');
  }
}
