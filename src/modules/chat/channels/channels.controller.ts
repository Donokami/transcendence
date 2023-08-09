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
  Session,
  UseFilters,
  UseGuards
} from '@nestjs/common'
import { ApiOperation } from '@nestjs/swagger'

import { GlobalExceptionFilter } from '@/core/filters/global-exception.filters'
import { AuthGuard } from '@/core/guards/auth.guard'
import { ISession } from '@/core/types'
import { ChannelsService } from '@/modules/chat/channels/channels.service'
import { OperationResult } from '@/modules/chat/channels/channels.service'
import { CurrentChannel } from '@/modules/chat/channels/decorators/current-channel.decorator'
import { CreateChannelDto } from '@/modules/chat/channels/dtos/create-channel.dto'
import { ChangeGroupPasswordDto } from '@/modules/chat/channels/dtos/change-group-password.dto'
import { HandleChannelDto } from '@/modules/chat/channels/dtos/handle-channel.dto'
import { JoinGroupDto } from '@/modules/chat/channels/dtos/join-group.dto'
import { MessageDto } from '@/modules/chat/channels/dtos/message.dto'
import { Channel } from '@/modules/chat/channels/entities/channel.entity'
import { Message } from '@/modules/chat/channels/entities/message.entity'
import { AdminshipGuard } from '@/modules/chat/channels/guards/adminship.guard'
import { MembershipGuard } from '@/modules/chat/channels/guards/membership.guard'
import { OwnershipGuard } from '@/modules/chat/channels/guards/ownership.guard'

// todo: change controller name "channels" to "chat"
@Controller('channels')
@UseFilters(new GlobalExceptionFilter())
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  // ****** //
  // LOGGER //
  // ****** //

  private logger = new Logger(ChannelsController.name)

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
    @Session() session: ISession,
    @Body() body: HandleChannelDto,
    @CurrentChannel() channel: Channel
  ): Promise<Channel> {
    const userId: string = session.userId
    const memberToBanId: string = body.userId
    return await this.channelsService.banMember(userId, memberToBanId, channel)
  }

  // ************** //
  // changePassword //
  // ************** //

  @Put('/:channelId/password/change')
  @ApiOperation({
    summary: 'Change the password of a group',
    operationId: 'changePassword',
    description: 'Change the password of a group',
    tags: ['chat']
  })
  @UseGuards(AuthGuard)
  @UseGuards(MembershipGuard)
  @UseGuards(OwnershipGuard)
  async changePassword(
    @Body() body: ChangeGroupPasswordDto,
    @CurrentChannel() channel: Channel
  ): Promise<OperationResult> {
    const userId: string = body.userId
    const newPassword: string = body.newPassword
    return await this.channelsService.changePassword(
      userId,
      newPassword,
      channel
    )
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
  async getMessages(@CurrentChannel() channel: Channel): Promise<Message[]> {
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
  async joinGroup(@Body() body: JoinGroupDto, @Session() session: ISession) {
    const userId = session.userId
    return await this.channelsService.joinGroup(userId, body)
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
    @Body() body: HandleChannelDto,
    @CurrentChannel() channel: Channel
  ): Promise<Channel> {
    const userId: string = session.userId
    const userToKickId: string = body.userId
    return this.channelsService.kickMember(userId, userToKickId, channel)
  }

  // ********* //
  // leaveGroup //
  // ********* //

  @Post('/group/leave')
  @ApiOperation({
    summary: 'Leave a group',
    operationId: 'leaveGroup',
    description: 'Leave a group',
    tags: ['chat']
  })
  @UseGuards(AuthGuard)
  @UseGuards(MembershipGuard)
  async leaveGroup(
    @Session() session: ISession,
    @CurrentChannel() channel: Channel
  ) {
    const userId: string = session.userId
    return await this.channelsService.leaveGroup(userId, channel)
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
    @Session() session: ISession,
    @Body() body: HandleChannelDto,
    @CurrentChannel() channel: Channel
  ): Promise<OperationResult> {
    const userId: string = session.userId
    const userToMuteId: string = body.userId
    return await this.channelsService.muteMember(userId, userToMuteId, channel)
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
    const userId: string = session.userId
    const messageBody: string = body.messageBody
    const date: any = body.date
    const message = await this.channelsService.postMessage(
      userId,
      messageBody,
      date,
      channel
    )

    return message
  }

  // *********** //
  // removeAdmin //
  // *********** //

  // todo: remove if not required
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

  // ******** //
  // setAdmin //
  // ********* //

  @Put('/:channelId/admins')
  @ApiOperation({
    summary: 'Set a user as an admin of a group',
    operationId: 'setAdmin',
    description: 'Set a user as an admin of a group',
    tags: ['chat']
  })
  @UseGuards(AuthGuard)
  @UseGuards(MembershipGuard)
  @UseGuards(OwnershipGuard)
  async setAdmin(
    @Session() session: ISession,
    @Body() body: HandleChannelDto,
    @CurrentChannel() channel: Channel
  ): Promise<Channel> {
    const userId: string = session.userId
    const userToPromoteId: string = body.userId
    return await this.channelsService.setAdmin(userId, userToPromoteId, channel)
  }

  // *********** //
  // unBanMember //
  // *********** //

  // todo: remove if not required
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
}
