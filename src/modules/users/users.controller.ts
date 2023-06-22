import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@/core/guards/auth.guard';
import { SocialService } from '@/modules/social/social.service';

import { User } from './user.entity';
import { UserDto } from './dtos/user.dto';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dtos/update-user.dto';
import { CurrentUser } from './decorators/current-user.decorator';

import { Serialize } from '@/core/interceptors/serialize.interceptor';

@Controller('user')
@Serialize(UserDto)
export class UsersController {
  constructor(
    private usersService: UsersService,
    private readonly socialService: SocialService,
  ) {}

  @Get('/me')
  @UseGuards(AuthGuard)
  whoAmI(@CurrentUser() user: User) {
    return user;
  }

  @Get('/:id/friends')
  @UseGuards(AuthGuard)
  async getFriends(@Param('id') id: string) {
    return this.socialService.getFriends(id);
  }

  @Get('/:id/friend-requests')
  @UseGuards(AuthGuard)
  async getFriendRequests(@Param('id') id: string) {
    return this.socialService.getFriendRequests(id);
  }

  @Get('/:id')
  async findUser(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @Get()
  findAllUsers(@Query('email') email: string) {
    return this.usersService.find(email);
  }

  @Delete('/:id')
  removeUser(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Patch('/:id')
  updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
    return this.usersService.update(id, body);
  }
}
