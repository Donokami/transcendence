import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { User } from '@/modules/users/user.entity'

import { Friendship } from './entities/friendship.entity'
import { SocialController } from './social.controller'
import { SocialService } from './social.service'
import { SocialGateway } from './social.gateway'
import { UsersService } from '../users/users.service'

@Module({
  imports: [TypeOrmModule.forFeature([Friendship, User])],
  controllers: [SocialController],
  providers: [SocialService, UsersService, SocialGateway],
  exports: [SocialService]
})
export class SocialModule { }
