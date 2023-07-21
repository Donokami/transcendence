import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  NotFoundException,
  Param,
  Patch,
  UseGuards
} from '@nestjs/common'

import { AuthGuard } from '@/core/guards/auth.guard'
import { Serialize } from '@/core/interceptors/serialize.interceptor'
import { Friendship } from '@/modules/social/entities/friendship.entity'
import { SocialService } from '@/modules/social/social.service'

import { User } from './user.entity'
import { UsersService } from './users.service'
import { UserDto } from './dtos/user.dto'
import { UpdateUserDto } from './dtos/update-user.dto'
import { CurrentUser } from './decorators/current-user.decorator'

import { OwnershipGuard } from './guards/ownership.guard'
import { ChannelsService } from '@/modules/chat/channels/channels.service'
import { Channel } from '@/modules/chat/channels/entities/channel.entity'

@Controller('user')
export class UsersController {
  // *********** //
  // CONSTRUCTOR //
  // *********** //

  constructor(
    private readonly usersService: UsersService,
    private readonly socialService: SocialService,
    private readonly channelsService: ChannelsService
  ) {}

  // ****** //
  // LOGGER //
  // ****** //

  private logger = new Logger(UsersController.name)

  // ***************** //
  // ROUTE DEFINITIONS //
  // ***************** //

  // ****** //
  // whoAmI //
  // ****** //

  @Get('/me')
  @UseGuards(AuthGuard)
  whoAmI(@CurrentUser() user: User): User {
    return user
  }

  // *********** //
  // getAllUsers //
  // *********** //

  @Get('/all')
  async getAllUsers(): Promise<User[]> {
    const users = await this.usersService.findAll()
    return users
  }

  // **************** //
  // getAllUsersStats //
  // **************** //

  @Get('/stats')
  async getAllUsersStats(): Promise<User[]> {
    const users = await this.usersService.findAllWithStats()
    return users
  }

  // ************ //
  // findUserById //
  // ************ //

  @Get('/:id')
  @UseGuards(AuthGuard)
  async findUserById(@Param('id') id: string): Promise<User> {
    const user = await this.usersService.findOneById(id)
    if (!user) {
      this.logger.error(`User with ID : ${id} not found.`)
      throw new NotFoundException(`User with ID : ${id} not found.`)
    }
    return user
  }

  // ********************* //
  // findUserByIdWithStats //
  // ********************* //

  @Get('/:id/stats')
  @UseGuards(AuthGuard)
  async findUserByIdWithStats(@Param('id') id: string): Promise<User> {
    const user = await this.usersService.findOneByIdWithStats(id)
    if (!user) {
      this.logger.error(`User with ID : ${id} not found.`)
      throw new NotFoundException(`User with ID : ${id} not found.`)
    }
    return user
  }

  @Get('/:id/channels')
  @UseGuards(AuthGuard)
  async getUserChannels(@Param('id') id: string): Promise<Channel[]> {
    const channels = await this.channelsService.getChannels(id)

    return channels
  }

  // ********** //
  // updateUser //
  // ********** //

  @Patch('/:id')
  @UseGuards(AuthGuard)
  async updateUser(
    @Param('id') id: string,
    @Body() body: UpdateUserDto
  ): Promise<User> {
    return await this.usersService.update(id, body)
  }

  // ********** //
  // removeUser //
  // ********** //

  @Delete('/:id')
  @UseGuards(AuthGuard)
  @UseGuards(OwnershipGuard)
  async removeUser(@Param('id') id: string) {
    return await this.usersService.remove(id)
  }
}
