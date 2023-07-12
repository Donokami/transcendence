import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersModule } from '@/modules/users/users.module';
import { ChannelsModule } from '@/modules/channels/channels.module';
import { AuthModule } from '@/modules/auth/auth.module';

import { ChatGateway } from './chat.gateway';
import { Channel } from '@/modules/channels/entities/channel.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Channel]),
    UsersModule,
    ChannelsModule,
    AuthModule,
  ],
  providers: [ChatGateway],
})
export class ChatModule {}
