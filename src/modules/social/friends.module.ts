import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '@/modules/auth/auth.module';
import { UsersModule } from '@/modules/users/users.module';
import { UsersService } from '@/modules/users/users.service';

import { Friend } from './entities/friend.entity';
import { FriendsService } from './friends.service';
import { FriendsController } from './friends.controller';
import { BlockedUser } from './entities/blockedUser.entity';
import { PendingRequest } from './entities/pendingRequest.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Friend]), UsersModule, AuthModule],
  controllers: [FriendsController],
  providers: [FriendsService],
  exports: [FriendsService],
})
export class FriendsModule {}
