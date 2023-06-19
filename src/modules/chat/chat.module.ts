import { Module } from '@nestjs/common';

import { UsersModule } from '@/modules/users/users.module';
import { ChannelsModule } from '@/modules/channels/channels.module';
import { AuthModule } from '@/modules/auth/auth.module';

import { ChatGateway } from './chat.gateway';

@Module({
  imports: [UsersModule, ChannelsModule, AuthModule],
  providers: [ChatGateway],
})
export class ChatModule {}
