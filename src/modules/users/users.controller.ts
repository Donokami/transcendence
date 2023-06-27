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
import { Serialize } from '@/core/interceptors/serialize.interceptor';
import { Friendship } from '@/modules/social/entities/friendship.entity';
import { SocialService } from '@/modules/social/social.service';

import { User } from './user.entity';
import { UserDto } from './dtos/user.dto';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dtos/update-user.dto';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('user')
@Serialize(UserDto)
export class UsersController {
  constructor(private usersService: UsersService) {}
  constructor(
    private usersService: UsersService,
    private readonly socialService: SocialService,
  ) {}

  // ****** //
  // whoAmI //
  // ****** //

  @Get('/me')
  @UseGuards(AuthGuard)
  whoAmI(@CurrentUser() user: User): User {
    return user;
  }

  // *********** //
  // getAllUsers //
  // *********** //

  @Get('/all')
  async getAllUsers(): Promise<User[]> {
    const users = await this.usersService.findAll();
    return users;
  }

  // ************ //
  // findUserById //
  // ************ //

  @Get('/:id')
  async findUserById(@Param('id') id: string): Promise<User> {
    const user = await this.usersService.findOneById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  // ********** //
  // getFriends //
  // ********** //

  @Get('/:id/friends')
  @UseGuards(AuthGuard)
  async getFriends(@Param('id') id: string): Promise<User[]> {
    const friends = await this.socialService.getFriends(id);
    return friends;
  }

  // ***************** //
  // getFriendRequests //
  // ***************** //

  @Get('/:id/friend-requests')
  @UseGuards(AuthGuard)
  async getFriendRequests(@Param('id') id: string): Promise<Friendship[]> {
    const friendRequests = await this.socialService.getFriendRequests(id);
    return friendRequests;
  }

  // ********** //
  // updateUser //
  // ********** //

  @Patch('/:id')
  updateUser(
    @Param('id') id: string,
    @Body() body: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(id, body);
  }

  // ********** //
  // removeUser //
  // ********** //

  @Delete('/:id')
  removeUser(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
