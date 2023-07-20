import { Module, forwardRef } from '@nestjs/common'

import { UsersModule } from '@/modules/users/users.module'

import { ChatGateway } from './chat.gateway'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Channel } from './channels/entities/channel.entity'
import { Message } from './channels/entities/message.entity'
import { ChannelsService } from './channels/channels.service'
import { ChannelsController } from './channels/channels.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Channel, Message]), UsersModule],
  controllers: [ChannelsController],
  providers: [ChatGateway, ChannelsService],
  exports: [ChannelsService]
})
export class ChatModule {}
