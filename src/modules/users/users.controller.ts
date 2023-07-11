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
import { UsersService } from './users.service';
import { UserDto } from './dtos/user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { CurrentUser } from './decorators/current-user.decorator';

import { OwnershipGuard } from './guards/ownership.guard';

@Controller('user')
@Serialize(UserDto)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
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
  @UseGuards(AuthGuard)
  async findUserById(@Param('id') id: string): Promise<User> {
    const user = await this.usersService.findOneById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  // ********** //
  // updateUser //
  // ********** //

  @Patch('/:id')
  @UseGuards(AuthGuard)
  async updateUser(
    @Param('id') id: string,
    @Body() body: UpdateUserDto,
  ): Promise<User> {
    return await this.usersService.update(id, body);
  }

  // ********** //
  // removeUser //
  // ********** //

  @Delete('/:id')
  @UseGuards(AuthGuard)
  @UseGuards(OwnershipGuard)
  async removeUser(@Param('id') id: string) {
    return await this.usersService.remove(id);
  }
}
