import { APP_INTERCEPTOR } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

import { CurrentUserInterceptor } from './interceptors/current-user.interceptor';

import { AuthService } from './auth.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [
    UsersService,
    AuthService,
    { provide: APP_INTERCEPTOR, useClass: CurrentUserInterceptor },
  ],
  exports: [UsersService, AuthService],
})
export class UsersModule {}
