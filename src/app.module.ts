import { Module, ValidationPipe, MiddlewareConsumer } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ChannelsModule } from './channels/channels.module';
import { Channel } from './channels/entities/channel.entity';

import { ChatModule } from './chat/chat.module';

import { GameModule } from './game/game.module';

import { Message } from './channels/entities/message.entity';

import { UsersModule } from './users/users.module';
import { User } from './users/user.entity';

const cookieSession = require('cookie-session');

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME_DEVELOPMENT,
      entities: [Channel, Message, User],
      synchronize: true,
    }),
    ChannelsModule,
    ChatModule,
    GameModule,
    UsersModule,
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
    consumer.apply(cookieSession({ keys: ['cookieString'] })).forRoutes('*');
  }
}
