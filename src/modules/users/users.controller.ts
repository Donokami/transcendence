import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  BadRequestException,
  Param,
  Patch,
  Post,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  UseFilters,
  Session
} from '@nestjs/common'

import { AuthGuard } from '@/core/guards/auth.guard'
import { Serialize } from '@/core/interceptors/serialize.interceptor'
import { Friendship } from '@/modules/social/entities/friendship.entity'
import { SocialService } from '@/modules/social/social.service'
import { FileUploadExceptionFilter } from '@/core/filters/file-upload-exception.filter'

import { User } from './user.entity'
import { UsersService } from './users.service'
import { UpdateUserDto } from './dtos/update-user.dto'
import { CurrentUser } from './decorators/current-user.decorator'

import { UsernameGuard } from '@/core/guards/username.guard'
import { OwnershipGuard } from './guards/ownership.guard'
import { Paginate, PaginateQuery, Paginated } from 'nestjs-paginate'
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger'
import { PaginateQueryOptions } from '@/core/decorators/pagination'

import { FileInterceptor } from '@nestjs/platform-express'
import { memoryStorage } from 'multer'
import * as sharp from 'sharp'
import { GlobalExceptionFilter } from '@/core/filters/global-exception.filters'
import { UserNotFound } from '@/core/exceptions'
import { ChannelsService } from '@/modules/chat/channels/channels.service'
import { Channel } from '@/modules/chat/channels/entities/channel.entity'
import { ISession } from '@/core/types'

@Controller('user')
@UseFilters(new GlobalExceptionFilter())
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

  // *********** //
  // getAllUsers //
  // *********** //

  @Get()
  @UseGuards(AuthGuard)
  @UseGuards(UsernameGuard)
  @PaginateQueryOptions()
  @ApiOkResponse({
    description: 'The user records',
    type: Paginated<User> // fix: not working
  })
  @ApiOperation({
    summary: 'Get all users',
    operationId: 'getAllUsers',
    description: 'Get all users',
    tags: ['users']
  })
  getAllUsers(@Paginate() query: PaginateQuery): Promise<Paginated<User>> {
    return this.usersService.findAll(query)
  }

  // **************** //
  // getAllUsersStats //
  // **************** //

  @Get('/stats')
  @UseGuards(AuthGuard)
  @UseGuards(UsernameGuard)
  @PaginateQueryOptions()
  @ApiOperation({
    summary: 'Get all users with stats',
    operationId: 'getAllUsersStats',
    description: 'Get all users with stats',
    tags: ['users']
  })
  // @ApiQuery({ name: "filter.parentId", required: false, description: "Possible values: '$null' or '$eq:_id_' ", example: "$null" })
  async getAllUsersStats(
    @Paginate() query: PaginateQuery
  ): Promise<Paginated<User>> {
    const users = await this.usersService.findAllWithStats(query)
    return users
  }

  // *********** //
  // upload file //
  // *********** //

  @Post('/upload')
  @UseGuards(AuthGuard)
  @UseGuards(UsernameGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: 1024 * 1024 * 2,
        files: 1
      }
    })
  )
  @UseFilters(FileUploadExceptionFilter)
  @ApiOperation({
    summary: 'Upload file',
    operationId: 'uploadFile',
    description: 'Upload file',
    tags: ['users']
  })
  async uploadFile(
    @CurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File
  ): Promise<{ status: string }> {
    try {
      await sharp(file.buffer).metadata()
    } catch (error) {
      throw new BadRequestException('Invalid file type')
    }

    if (user.profilePicture?.includes('uploads/')) {
      await this.usersService.deleteFile(user.profilePicture)
    }

    const filePath = await this.usersService.saveFile(file)
    await this.usersService.update(user.id, { profilePicture: filePath })

    return { status: 'success' }
  }

  // ****** //
  // whoAmI //
  // ****** //

  @Get('/me')
  @UseGuards(AuthGuard)
  @ApiOkResponse({
    description: 'The current user',
    type: User
  })
  @ApiOperation({
    summary: 'Get current user',
    operationId: 'whoAmI',
    description: 'Get current user',
    tags: ['users']
  })
  whoAmI(@CurrentUser() user: User): User {
    if (!user) {
      throw new UserNotFound()
    }
    return user
  }

  @Get('/me/channels')
  @UseGuards(AuthGuard)
  @UseGuards(UsernameGuard)
  @ApiOperation({
    summary: 'Get current user channels',
    operationId: 'getUserChannels',
    description: 'Get current user channels',
    tags: ['users']
  })
  async getUserChannels(@Session() session: ISession): Promise<Channel[]> {
    const channels = await this.channelsService.getChannels(session.userId)

    return channels
  }

  // ************ //
  // findUserById //
  // ************ //

  @Get('/:id')
  @UseGuards(AuthGuard)
  @UseGuards(UsernameGuard)
  @ApiOkResponse({
    description: 'The user corresponding on the passed id',
    type: User
  })
  @ApiOperation({
    summary: 'Get user by ID',
    operationId: 'findUserById',
    description: 'Get user by ID',
    tags: ['users']
  })
  async findUserById(@Param('id') id: string): Promise<User> {
    const user = await this.usersService.findOneById(id)
    if (!user) {
      throw new UserNotFound()
    }
    return user
  }

  // ********************* //
  // findUserByIdWithStats //
  // ********************* //

  @Get('/:id/stats')
  @UseGuards(AuthGuard)
  @UseGuards(UsernameGuard)
  @ApiOperation({
    summary: 'Get user by ID with stats',
    operationId: 'findUserByIdWithStats',
    description: 'Get user by ID with stats',
    tags: ['users']
  })
  async findUserByIdWithStats(@Param('id') id: string): Promise<User> {
    const user = await this.usersService.findOneByIdWithStats(id)
    if (!user) {
      throw new UserNotFound()
    }
    return user
  }

  // ********** //
  // updateUser //
  // ********** //

  @Patch('/:id')
  @UseGuards(AuthGuard)
  @UseGuards(OwnershipGuard)
  @Serialize(User)
  @ApiOperation({
    summary: 'Update user',
    operationId: 'updateUser',
    description: 'Update user',
    tags: ['users']
  })
  async updateUser(
    @Param('id') id: string,
    @Body() body: UpdateUserDto
  ): Promise<User> {
    console.log('id, body', id, body)
    return await this.usersService.update(id, body)
  }

  // ********** //
  // removeUser //
  // ********** //

  @Delete('/:id')
  @UseGuards(AuthGuard)
  @UseGuards(OwnershipGuard)
  @ApiOperation({
    summary: 'Remove user',
    operationId: 'removeUser',
    description: 'Remove user',
    tags: ['users']
  })
  async removeUser(@Param('id') id: string): Promise<User> {
    return await this.usersService.remove(id)
  }
}
