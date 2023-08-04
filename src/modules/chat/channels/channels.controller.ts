import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  NotFoundException,
  Param,
  Post,
  Put,
  Req,
  Session,
  UseFilters,
  UseGuards
} from '@nestjs/common'

import { ApiOperation } from '@nestjs/swagger'

import { GlobalExceptionFilter } from '@/core/filters/global-exception.filters'
import { AuthGuard } from '@/core/guards/auth.guard'
import { ChannelsService } from '@/modules/chat/channels/channels.service'
import { CreateChannelDto } from '@/modules/chat/channels/dtos/create-channel.dto'
import { JoinGroupDto } from '@/modules/chat/channels/dtos/join-group.dto'
import { MessageDto } from '@/modules/chat/channels/dtos/message.dto'
import { Channel } from '@/modules/chat/channels/entities/channel.entity'
import { AdminshipGuard } from '@/modules/chat/channels/guards/adminship.guard'
import { MembershipGuard } from '@/modules/chat/channels/guards/membership.guard'
import { OwnershipGuard } from '@/modules/chat/channels/guards/ownership.guard'
import { CurrentChannel } from './decorators/current-channel.decorator'
import { ISession } from '@/core/types'
import { HandleChannelDto } from './dtos/handle-channel.dto'

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

  @Put('/:channelId/admins')
  @ApiOperation({
    summary: 'Add a user to the admins list of a group',
    operationId: 'addAdmin',
    description: 'Add a user to the admins list of a group',
    tags: ['chat']
  })
  @UseGuards(AuthGuard)
  @UseGuards(MembershipGuard)
  @UseGuards(OwnershipGuard)
  async addAdmin(
    @Body('userId') userId: string,
    @CurrentChannel() channel: Channel
  ): Promise<Channel> {
    return await this.channelsService.addAdmin(channel, userId)
  }

  // ********* //
  // banMember //
  // ********* //

  @Put('/:channelId/ban')
  @ApiOperation({
    summary: 'Ban a member from a group',
    operationId: 'banMember',
    description: 'Ban a member from a group',
    tags: ['chat']
  })
  @UseGuards(AuthGuard)
  @UseGuards(MembershipGuard)
  @UseGuards(AdminshipGuard)
  async banMember(
    @CurrentChannel() channel: Channel,
    @Body('userId') userId: string
  ): Promise<Channel> {
    return await this.channelsService.banMember(channel, userId)
  }

  // ************* //
  // createChannel //
  // ************* //

  @Post('/create')
  @ApiOperation({
    summary: 'Create a new channel',
    operationId: 'createChannel',
    description: 'Create a new channel',
    tags: ['chat']
  })
  @UseGuards(AuthGuard)
  async createChannel(
    @Body() body: CreateChannelDto,
    @Session() session: ISession
  ): Promise<Channel> {
    const ownerId = session.userId
    const channel = await this.channelsService.createChannel(body, ownerId)
    if (!channel)
      throw new NotFoundException(`Failed to create ${body.name} channel `)
    return channel
  }

  // *********** //
  // getChannel //
  // *********** //

  @Get('/:channelId')
  @ApiOperation({
    summary: 'Get a channel (via channel id)',
    operationId: 'getChannel',
    description: 'Get a channel (via channel id)',
    tags: ['chat']
  })
  @UseGuards(AuthGuard)
  @UseGuards(MembershipGuard)
  async getChannel(@CurrentChannel() channel: Channel) {
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
  @UseGuards(MembershipGuard)
  async getGroupByName(@Param('name') name: string): Promise<Channel> {
    const channel = await this.channelsService.findOneByName(name)
    if (!channel)
      throw new NotFoundException(`Group with name ${name} not found`)
    return channel
  }

  // *********** //
  // getMessages //
  // *********** //

  @Get('/:channelId/messages')
  @ApiOperation({
    summary: 'Get all the messages sent in a channel (via channel id)',
    operationId: 'getMessages',
    description: 'Get all the messages sent in a channel (via channel id)',
    tags: ['chat']
  })
  @UseGuards(AuthGuard)
  @UseGuards(MembershipGuard)
  async getMessages(@CurrentChannel() channel: Channel) {
    return await this.channelsService.getMessages(channel)
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
  async joinGroup(
    @Body() joinGroupDto: JoinGroupDto,
    @Session() session: ISession
  ) {
    const newMemberId = session.userId
    return await this.channelsService.joinGroup(joinGroupDto, newMemberId)
  }

  // ********** //
  // kickMember //
  // ********** //

  @Put('/:channelId/kick')
  @ApiOperation({
    summary: 'Kick a member from a group',
    operationId: 'kickMember',
    description: 'Kick a member from a group',
    tags: ['chat']
  })
  @UseGuards(AuthGuard)
  @UseGuards(MembershipGuard)
  @UseGuards(AdminshipGuard)
  async kickMember(
    @Session() session: ISession,
    @CurrentChannel() channel: Channel,
    @Body() body: HandleChannelDto
  ): Promise<Channel> {
    return this.channelsService.kickMember(session.userId, channel, body.userId)
  }

  // ********** //
  // muteMember //
  // ********** //

  @Put('/:channelId/mute')
  @ApiOperation({
    summary: 'Mute a group member',
    operationId: 'muteMember',
    description: 'Mute a group member',
    tags: ['chat']
  })
  @UseGuards(AuthGuard)
  @UseGuards(MembershipGuard)
  @UseGuards(AdminshipGuard)
  async muteMember(
    @CurrentChannel() channel: Channel,
    @Body('userId') userId: string
  ): Promise<void> {
    return await this.channelsService.muteMember(channel, userId)
  }

  // ************ //
  // postMessages //
  // ************ //

  @Post('/:channelId/messages')
  @ApiOperation({
    summary: 'Post messages sent in a channel, in the database',
    operationId: 'postMessages',
    description: 'Post messages sent in a channel, in the database',
    tags: ['chat']
  })
  @UseGuards(AuthGuard)
  @UseGuards(MembershipGuard)
  async postMessages(
    @CurrentChannel() channel: Channel,
    @Session() session: ISession,
    @Body() body: MessageDto
  ) {
    const { messageBody, date } = body
    const message = await this.channelsService.postMessage(session.userId, {
      channel,
      messageBody,
      date
    })

    return message
  }

  // *********** //
  // removeAdmin //
  // *********** //

  @Delete('/:channelId/admins/:userId')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Remove a user from the admins list of a group',
    operationId: 'removeAdmin',
    description: 'Remove a user from the admins list of a group',
    tags: ['chat']
  })
  @UseGuards(MembershipGuard)
  @UseGuards(OwnershipGuard)
  async removeAdmin(
    @CurrentChannel() channel: Channel,
    @Param('userId') userId: string
  ): Promise<Channel> {
    return this.channelsService.removeAdmin(channel, userId)
  }

  // *********** //
  // unBanMember //
  // *********** //

  @Delete('/:channelId/bannedMembers/:userId')
  @ApiOperation({
    summary: 'Un-ban a user from a group',
    operationId: 'unBanMember',
    description: 'Un-ban a user from a group',
    tags: ['chat']
  })
  @UseGuards(AuthGuard)
  @UseGuards(MembershipGuard)
  @UseGuards(AdminshipGuard)
  async unBanMember(
    @CurrentChannel() channel: Channel,
    @Param('userId') userId: string
  ): Promise<Channel> {
    return this.channelsService.unBanMember(channel, userId)
  }

  // ************ //
  // unMuteMember //
  // ************ //

  @Delete('/:channelId/mutedMembers/:userId')
  @ApiOperation({
    summary: 'Un-mute a group member',
    operationId: 'unMuteMember',
    description: 'Un-mute a group member',
    tags: ['chat']
  })
  @UseGuards(AuthGuard)
  @UseGuards(MembershipGuard)
  @UseGuards(AdminshipGuard)
  async unMuteMember(
    @CurrentChannel() channel: Channel,
    @Param('userId') userId: string
  ): Promise<Channel> {
    return this.channelsService.unMuteMember(channel, userId)
  }
}
