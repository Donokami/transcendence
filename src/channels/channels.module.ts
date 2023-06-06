import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Channel } from './entities/channel.entity';
import { ChannelsController } from './channels.controller';
import { ChannelsService } from './channels.service';

import { Message } from './entities/message.entity';

import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Channel, Message]), UsersModule],
  controllers: [ChannelsController],
  providers: [ChannelsService],
  exports: [ChannelsService],
})
export class ChannelsModule {}
