import { Injectable } from '@nestjs/common';
import {
  type TypeOrmOptionsFactory,
  type TypeOrmModuleOptions,
} from '@nestjs/typeorm';

import { Channel } from '@/modules/channels/entities/channel.entity';
import { Friendship } from '@/modules/social/entities/friendship.entity';
import { Message } from '@/modules/channels/entities/message.entity';
import { User } from '@/modules/users/user.entity';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions {
    switch (process.env.NODE_ENV) {
      case 'production':
        return {
          type: 'postgres',
          host: process.env.DB_HOST,
          port: parseInt(process.env.DB_PORT),
          username: process.env.DB_USER,
          password: process.env.DB_PASS,
          database: process.env.DB_NAME_DEVELOPMENT,
          entities: [Channel, Friendship, Message, User],
          synchronize: true,
        };
      case 'development':
        return {
          type: 'sqlite',
          database: 'db.sqlite',
          entities: [Channel, Friendship, Message, User],
          synchronize: true,
        };
      case 'test':
        return {
          type: 'sqlite',
          database: 'db.sqlite',
          entities: [Channel, Friendship, Message, User],
          synchronize: true,
          dropSchema: true,
        };
    }
  }
}
