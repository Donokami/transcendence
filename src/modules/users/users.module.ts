import { APP_INTERCEPTOR } from '@nestjs/core'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Friendship } from '@/modules/social/entities/friendship.entity'

import { User } from './user.entity'
import { UsersService } from './users.service'
import { UsersController } from './users.controller'

import { CurrentUserInterceptor } from './interceptors/current-user.interceptor'
import { SocialModule } from '@/modules/social/social.module'
import { ChatModule } from '@/modules/chat/chat.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Friendship]),
    SocialModule,
    ChatModule
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    { provide: APP_INTERCEPTOR, useClass: CurrentUserInterceptor }
  ],
  exports: [UsersService]
})
export class UsersModule { }
