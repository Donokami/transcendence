import { Injectable } from '@nestjs/common'
import {
  type TypeOrmOptionsFactory,
  type TypeOrmModuleOptions
} from '@nestjs/typeorm'

import { Channel } from '@/modules/chat/channels/entities/channel.entity'
import { Friendship } from '@/modules/social/entities/friendship.entity'
import { Message } from '@/modules/chat/channels/entities/message.entity'
import { MutedUser } from '@/modules/chat/channels/entities/muted-user.entity'
import { User } from '@/modules/users/user.entity'
import { ConfigService } from '@nestjs/config'
import { Match } from '@/modules/game/entities/match.entity'

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  private readonly configService: ConfigService = new ConfigService()
  createTypeOrmOptions(): TypeOrmModuleOptions {
    switch (this.configService.get('NODE_ENV') || 'development') {
      case 'production':
        return {
          type: 'postgres',
          host: process.env.DB_HOST,
          port: parseInt(process.env.DB_PORT),
          username: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME,
          entities: [Channel, Friendship, Message, User, MutedUser, Match],
          synchronize: true
        }
      case 'development':
        return {
          type: 'sqlite',
          database: process.env.DB_PATH + process.env.DB_NAME + '.dev.sqlite',
          entities: [Channel, Friendship, Message, User, MutedUser, Match],
          synchronize: true
        }
      case 'test':
        return {
          type: 'sqlite',
          database: process.env.DB_PATH + process.env.DB_NAME + '.test.sqlite',
          entities: [Channel, Friendship, Message, User, MutedUser, Match],
          synchronize: true,
          dropSchema: true
        }
    }
  }
}
