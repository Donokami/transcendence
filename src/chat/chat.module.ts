import { Module } from '@nestjs/common';

import { ChatGateway } from './chat.gateway';

import { UsersModule } from '../users/users.module';
import { ChannelsModule } from '../channels/channels.module';

@Module({
  imports: [UsersModule, ChannelsModule],
  providers: [ChatGateway],
})
export class ChatModule {}
