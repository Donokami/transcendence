import { Module } from '@nestjs/common';

import { ChatGateway } from './chat.gateway';

import { UsersModule } from '@/modules/users/users.module';
import { ChannelsModule } from '@/modules/channels/channels.module';
import { AuthModule } from '@/modules/auth/auth.module';

@Module({
  imports: [UsersModule, ChannelsModule, AuthModule],
  providers: [ChatGateway],
})
export class ChatModule { }
