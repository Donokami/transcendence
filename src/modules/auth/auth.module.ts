import { Module } from '@nestjs/common';

import { UsersModule } from '@/modules/users/users.module';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '@/modules/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { FortyTwoStrategy } from './forty-two.strategy';
import { UserSerializer } from './user.serializer';

@Module({
  imports: [UsersModule, PassportModule.register({ session: true })],
  controllers: [AuthController],
  providers: [AuthService, FortyTwoStrategy, UserSerializer],
  exports: [AuthService],
})
export class AuthModule {}
export class AuthModule {}
