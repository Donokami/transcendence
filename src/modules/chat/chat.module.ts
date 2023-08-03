import { Module, forwardRef } from '@nestjs/common'

import { UsersModule } from '@/modules/users/users.module'

import { ChatGateway } from './chat.gateway'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Channel } from '@/modules/chat/channels/entities/channel.entity'
import { Message } from '@/modules/chat/channels/entities/message.entity'
import { MutedUser } from '@/modules/chat/channels/entities/muted-user.entity'
import { User } from '@/modules/users/user.entity'
import { ChannelsService } from './channels/channels.service'
import { ChannelsController } from './channels/channels.controller'

@Module({
  imports: [
    TypeOrmModule.forFeature([Channel, Message, MutedUser, User]),
    forwardRef(() => UsersModule)
  ],
  controllers: [ChannelsController],
  providers: [ChatGateway, ChannelsService],
  exports: [ChannelsService]
})
export class ChatModule {}
