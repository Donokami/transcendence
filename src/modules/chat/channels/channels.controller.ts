import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  NotFoundException,
  Param,
  Post,
  Put,
  Session,
  UseFilters,
  UseGuards
} from '@nestjs/common'

import { AuthGuard } from '@/core/guards/auth.guard'

import { ChannelsService } from './channels.service'

import { CreateChannelDto } from './dtos/create-channel.dto'
import { JoinGroupDto } from './dtos/join-group.dto'
import { MessageDto } from './dtos/message.dto'
import { GlobalExceptionFilter } from '@/core/filters/global-exception.filters'
import { Channel } from '@/modules/chat/channels/entities/channel.entity'
import { ApiOperation } from '@nestjs/swagger'

@Controller('channels')
@UseFilters(new GlobalExceptionFilter())
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  // ****** //
  // LOGGER //
  // ****** //

  private logger = new Logger(ChannelsController.name)

  // ******** //
  // addAdmin //
  // ********* //

  // todo: add other guards as necessary
  @Put('/:channelId/admins')
  @ApiOperation({
    summary: 'Add a user to the admins list of a group',
    operationId: 'addAdmin',
    description: 'Add a user to the admins list of a group',
    tags: ['chat']
  })
  @UseGuards(AuthGuard)
  // @UseGuards(ChatMemberGuard)
  // @UseGuards(ChatOwnershipGuard)
  async addAdmin(
    @Param('channelId') channelId: string,
    @Body('userId') userId: string
  ): Promise<Channel> {
    return await this.channelsService.addAdmin(channelId, userId)
  }

  // ********* //
  // banMember //
  // ********* //

  // todo: add other guards as necessary
  @Put('/:channelId/ban')
  @ApiOperation({
    summary: 'Ban a member from a group',
    operationId: 'banMember',
    description: 'Ban a member from a group',
    tags: ['chat']
  })
  @UseGuards(AuthGuard)
  // @UseGuards(ChatMemberGuard)
  // @UseGuards(ChatAdminGuard)
  async banMember(
    @Param('channelId') channelId: string,
    @Body('userId') userId: string
  ): Promise<Channel> {
    const channel = this.channelsService.banMember(channelId, userId)
    // if (!channel)
    //   throw new BadRequestException(
    //     `Failed to ban user with ID : ${userId} from channel with ID: ${channelId}`
    //   )
    return channel
  }

  // ************* //
  // createChannel //
  // ************* //

  // todo: check error handling
  @Post('/create')
  @ApiOperation({
    summary: 'Create a new channel',
    operationId: 'createChannel',
    description: 'Create a new channel',
    tags: ['chat']
  })
  @UseGuards(AuthGuard)
  async createChannel(@Body() body: CreateChannelDto): Promise<Channel> {
    const channel = await this.channelsService.createChannel(body)
    if (!channel)
      throw new NotFoundException(`Failed to create ${body.name} channel `)
    return channel
  }

  // *********** //
  // getChannel //
  // *********** //

  // todo: add other guards as necessary
  @Get('/:id')
  @ApiOperation({
    summary: 'Get a channel (via channel id)',
    operationId: 'getChannel',
    description: 'Get a channel (via channel id)',
    tags: ['chat']
  })
  @UseGuards(AuthGuard)
  // @UseGuards(ChatMemberGuard) , may cause problems
  async getChannel(@Param('id') id: string): Promise<Channel> {
    const channel = await this.channelsService.findOneById(id)
    if (!channel) {
      throw new NotFoundException(`Channel with name ${id} not found`)
    }
    return channel
  }

  // ************** //
  // getGroupByName //
  // ************** //

  @Get('/group/:name')
  @ApiOperation({
    summary: 'Get a group (via channel name)',
    operationId: 'getGroupByName',
    description: 'Get a group (via channel name)',
    tags: ['chat']
  })
  @UseGuards(AuthGuard)
  async getGroupByName(@Param('name') name: string): Promise<Channel> {
    const channel = await this.channelsService.findOneByName(name)
    if (!channel)
      throw new NotFoundException(`Group with name ${name} not found`)
    return channel
  }

  // *********** //
  // getMessages //
  // *********** //

  // todo: add other guards as necessary
  @Get('/:id/messages')
  @ApiOperation({
    summary: 'Get all the messages sent in a channel (via channel id)',
    operationId: 'getMessages',
    description: 'Get all the messages sent in a channel (via channel id)',
    tags: ['chat']
  })
  @UseGuards(AuthGuard)
  // @UseGuards(ChatMemberGuard)
  async getMessages(@Param('id') id: string) {
    const messages = await this.channelsService.getMessages(id)
    if (messages === null) {
      throw new NotFoundException(
        `Failed to get messages from channel with ID : ${id}`
      )
    }

    return messages
  }

  // ********* //
  // joinGroup //
  // ********* //

  @Post('/group/join')
  @ApiOperation({
    summary: 'Join a group',
    operationId: 'joinGroup',
    description: 'Join a group',
    tags: ['chat']
  })
  @UseGuards(AuthGuard)
  async joinGroup(@Body() joinGroupDto: JoinGroupDto, @Session() session: any) {
    const newMemberId = session.id
    return await this.channelsService.joinGroup(joinGroupDto, newMemberId)
  }

  // ********** //
  // kickMember //
  // ********** //

  // todo : add other guards as necessary
  @Put('/:channelId/kick')
  @ApiOperation({
    summary: 'Kick a member from a group',
    operationId: 'kickMember',
    description: 'Kick a member from a group',
    tags: ['chat']
  })
  @UseGuards(AuthGuard)
  // @UseGuards(ChatMemberGuard)
  // @UseGuards(ChatAdminGuard)
  async kickMember(
    @Param('channelId') channelId: string,
    @Body('userId') userId: string
  ): Promise<Channel> {
    return this.channelsService.kickMember(channelId, userId)
  }

  // ********** //
  // muteMember //
  // ********** //

  // todo: add other guards as necessary
  @Put('/:channelId/mute')
  @ApiOperation({
    summary: 'Mute a group member',
    operationId: 'muteMember',
    description: 'Mute a group member',
    tags: ['chat']
  })
  @UseGuards(AuthGuard)
  // @UseGuards(ChatMemberGuard)
  // @UseGuards(ChatAdminGuard)
  async muteMember(
    @Param('channelId') channelId: string,
    @Body('userId') userId: string
  ): Promise<void> {
    return await this.channelsService.muteMember(channelId, userId)
  }

  // ************ //
  // postMessages //
  // ************ //

  // todo: add other guards as necessary
  @Post('/:id/messages')
  @ApiOperation({
    summary: 'Post messages sent in a channel, in the database',
    operationId: 'postMessages',
    description: 'Post messages sent in a channel, in the database',
    tags: ['chat']
  })
  @UseGuards(AuthGuard)
  // @UseGuards(ChatMemberGuard)
  async postMessages(@Param('id') id: string, @Body() body: MessageDto) {
    const { userId, messageBody, date } = body
    const message = await this.channelsService.postMessage({
      userId,
      channelId: id,
      messageBody,
      date
    })

    return message
  }

  // *********** //
  // removeAdmin //
  // *********** //

  // todo: add other guards as necessary
  @Delete('/:channelId/admins/:userId')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Remove a user from the admins list of a group',
    operationId: 'removeAdmin',
    description: 'Remove a user from the admins list of a group',
    tags: ['chat']
  })
  // @UseGuards(ChatMemberGuard)
  // @UseGuards(ChatOwnershipGuard)
  async removeAdmin(
    @Param('channelId') channelId: string,
    @Param('userId') userId: string
  ): Promise<Channel> {
    return this.channelsService.removeAdmin(channelId, userId)
  }

  // *********** //
  // unBanMember //
  // *********** //

  // todo: add other guards as necessary
  @Delete('/:channelId/bannedMembers/:userId')
  @ApiOperation({
    summary: 'Un-ban a user from a group',
    operationId: 'unBanMember',
    description: 'Un-ban a user from a group',
    tags: ['chat']
  })
  @UseGuards(AuthGuard)
  // @UseGuards(ChatMemberGuard)
  // @UseGuards(ChatAdminGuard)
  async unBanMember(
    @Param('channelId') channelId: string,
    @Param('userId') userId: string
  ): Promise<Channel> {
    return this.channelsService.unBanMember(channelId, userId)
  }

  // ************ //
  // unMuteMember //
  // ************ //

  // todo: add other guards as necessary
  @Delete('/:channelId/mutedMembers/:userId')
  @ApiOperation({
    summary: 'Un-mute a group member',
    operationId: 'unMuteMember',
    description: 'Un-mute a group member',
    tags: ['chat']
  })
  @UseGuards(AuthGuard)
  // @UseGuards(ChatMemberGuard)
  // @UseGuards(ChatAdminGuard)
  async unMuteMember(
    @Param('channelId') channelId: string,
    @Param('userId') userId: string
  ): Promise<Channel> {
    return this.channelsService.unMuteMember(channelId, userId)
  }
}
