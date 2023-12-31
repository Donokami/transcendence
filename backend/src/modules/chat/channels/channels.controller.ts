import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Post,
  Put,
  Session,
  UseFilters,
  UseGuards,
  UseInterceptors
} from '@nestjs/common'
import { ApiOperation } from '@nestjs/swagger'

import { DeleteResult } from 'typeorm'

import { GlobalExceptionFilter } from '@/core/filters/global-exception.filters'
import { AuthGuard } from '@/core/guards/auth.guard'
import { UsernameGuard } from '@/core/guards/username.guard'
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
import { GroupGuard } from '@/modules/chat/channels/guards/group.guard'
import { MembershipGuard } from '@/modules/chat/channels/guards/membership.guard'
import { OwnershipGuard } from '@/modules/chat/channels/guards/ownership.guard'
import { User } from '@/modules/users/user.entity'

@UseGuards(AuthGuard, UsernameGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('channels')
@UseFilters(new GlobalExceptionFilter())
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  @Put('/:channelId/ban')
  @ApiOperation({
    summary: 'Ban a member from a group',
    operationId: 'banMember',
    description: 'Ban a member from a group',
    tags: ['chat']
  })
  @UseGuards(GroupGuard)
  @UseGuards(MembershipGuard)
  @UseGuards(AdminshipGuard)
  async banMember(
    @Session() session: ISession,
    @Body() body: HandleChannelDto,
    @CurrentChannel() channel: Channel
  ): Promise<Channel> {
    const userId: string = session.userId
    const memberToBanId: string = body.userId
    const newChannel = await this.channelsService.banMember(
      userId,
      memberToBanId,
      channel
    )
    return newChannel
  }

  @Put('/:channelId/password/change')
  @ApiOperation({
    summary: 'Change the password of a group',
    operationId: 'changeGroupPassword',
    description: 'Change the password of a group',
    tags: ['chat']
  })
  @UseGuards(GroupGuard)
  @UseGuards(MembershipGuard)
  @UseGuards(OwnershipGuard)
  async changeGroupPassword(
    @Body() body: ChangeGroupPasswordDto,
    @CurrentChannel() channel: Channel
  ): Promise<OperationResult> {
    const newPassword: string = body.newPassword
    return await this.channelsService.changeGroupPassword(newPassword, channel)
  }

  @Post('/create')
  @ApiOperation({
    summary: 'Create a new channel',
    operationId: 'createChannel',
    description: 'Create a new channel',
    tags: ['chat']
  })
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

  @Delete('/:channelId/password/delete')
  @ApiOperation({
    summary: 'Delete the password of a group',
    operationId: 'deleteGroupPassword',
    description: 'Delete the password of a group',
    tags: ['chat']
  })
  @UseGuards(GroupGuard)
  @UseGuards(MembershipGuard)
  @UseGuards(OwnershipGuard)
  async deleteGroupPassword(
    @CurrentChannel() channel: Channel
  ): Promise<OperationResult> {
    return await this.channelsService.deleteGroupPassword(channel)
  }

  @Get('/:channelId/admins')
  @ApiOperation({
    summary: 'Get channel admins',
    operationId: 'getAdmins',
    description: 'Get channel admins',
    tags: ['chat']
  })
  @UseGuards(GroupGuard)
  @UseGuards(MembershipGuard)
  async getAdmins(@CurrentChannel() channel: Channel): Promise<User[]> {
    const admins = await this.channelsService.getAdmins(channel)
    return admins
  }

  @Get('/:channelId')
  @ApiOperation({
    summary: 'Get a channel (via channel id)',
    operationId: 'getChannel',
    description: 'Get a channel (via channel id)',
    tags: ['chat']
  })
  @UseGuards(MembershipGuard)
  async getChannel(@CurrentChannel() channel: Channel): Promise<Channel> {
    return channel
  }

  @Get('/:channelId/bannedMembers')
  @ApiOperation({
    summary: 'Get channel banned members',
    operationId: 'getBannedMembers',
    description: 'Get channel banned members',
    tags: ['chat']
  })
  @UseGuards(GroupGuard)
  @UseGuards(MembershipGuard)
  @UseGuards(AdminshipGuard)
  async getBannedMembers(@CurrentChannel() channel: Channel): Promise<User[]> {
    const bannedMembers = await this.channelsService.getBannedMembers(channel)
    return bannedMembers
  }

  @Get('/:channelId/owner')
  @ApiOperation({
    summary: 'Get channel owner',
    operationId: 'getOwner',
    description: 'Get channel owner',
    tags: ['chat']
  })
  @UseGuards(GroupGuard)
  @UseGuards(MembershipGuard)
  async getOwner(@CurrentChannel() channel: Channel): Promise<User> {
    const owner = await this.channelsService.getOwner(channel)
    return owner
  }

  @Get('/:channelId/messages')
  @ApiOperation({
    summary: 'Get all the messages sent in a channel (via channel id)',
    operationId: 'getMessages',
    description: 'Get all the messages sent in a channel (via channel id)',
    tags: ['chat']
  })
  @UseGuards(MembershipGuard)
  async getMessages(@CurrentChannel() channel: Channel): Promise<Message[]> {
    return await this.channelsService.getMessages(channel)
  }

  @Post('/group/join')
  @ApiOperation({
    summary: 'Join a group',
    operationId: 'joinGroup',
    description: 'Join a group',
    tags: ['chat']
  })
  async joinGroup(
    @Body() body: JoinGroupDto,
    @Session() session: ISession
  ): Promise<Channel> {
    const userId = session.userId
    const channel = await this.channelsService.joinGroup(userId, body)
    return channel
  }

  @Put('/:channelId/kick')
  @ApiOperation({
    summary: 'Kick a member from a group',
    operationId: 'kickMember',
    description: 'Kick a member from a group',
    tags: ['chat']
  })
  @UseGuards(GroupGuard)
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

  @Delete(':channelId/leave')
  @ApiOperation({
    summary: 'Leave a group',
    operationId: 'leaveGroup',
    description: 'Leave a group',
    tags: ['chat']
  })
  @UseGuards(GroupGuard)
  @UseGuards(MembershipGuard)
  async leaveGroup(
    @Session() session: ISession,
    @CurrentChannel() channel: Channel
  ): Promise<Channel | DeleteResult> {
    const userId: string = session.userId
    return await this.channelsService.leaveGroup(userId, channel)
  }

  @Put('/:channelId/mute')
  @ApiOperation({
    summary: 'Mute a group member',
    operationId: 'muteMember',
    description: 'Mute a group member',
    tags: ['chat']
  })
  @UseGuards(GroupGuard)
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

  @Post('/:channelId/messages')
  @ApiOperation({
    summary: 'Post messages sent in a channel, in the database',
    operationId: 'postMessages',
    description: 'Post messages sent in a channel, in the database',
    tags: ['chat']
  })
  @UseGuards(MembershipGuard)
  async postMessages(
    @CurrentChannel() channel: Channel,
    @Session() session: ISession,
    @Body() body: MessageDto
  ): Promise<Message> {
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

  @Get('/:channelId/isMuted')
  @ApiOperation({
    summary: 'Check if logged user is muted',
    operationId: 'isMuted',
    description: 'Check if logged user is muted',
    tags: ['chat']
  })
  @UseGuards(MembershipGuard)
  async isMuted(
    @CurrentChannel() channel: Channel,
    @Session() session: ISession
  ): Promise<boolean> {
    const userId: string = session.userId
    const isMuted = await this.channelsService.checkIsMuted(userId, channel)

    return isMuted
  }

  @Put('/:channelId/set-admin')
  @ApiOperation({
    summary: 'Set a user as an admin of a group',
    operationId: 'setAdmin',
    description: 'Set a user as an admin of a group',
    tags: ['chat']
  })
  @UseGuards(GroupGuard)
  @UseGuards(MembershipGuard)
  async setAdmin(
    @Body() body: HandleChannelDto,
    @CurrentChannel() channel: Channel
  ): Promise<Channel> {
    const userToPromoteId: string = body.userId
    return await this.channelsService.setAdmin(userToPromoteId, channel)
  }

  @Delete('/:channelId/unban')
  @ApiOperation({
    summary: 'Unban a member from a group',
    operationId: 'unbanMember',
    description: 'Unban a member from a group',
    tags: ['chat']
  })
  @UseGuards(GroupGuard)
  @UseGuards(MembershipGuard)
  @UseGuards(AdminshipGuard)
  async unbanMember(
    @Body() body: HandleChannelDto,
    @CurrentChannel() channel: Channel
  ): Promise<Channel> {
    const memberToUnbanId: string = body.userId
    return await this.channelsService.unbanMember(memberToUnbanId, channel)
  }

  @Delete('/:channelId/unmute')
  @ApiOperation({
    summary: 'Unmute a member from a group',
    operationId: 'unmuteMember',
    description: 'Unmute a member from a group',
    tags: ['chat']
  })
  @UseGuards(GroupGuard)
  @UseGuards(MembershipGuard)
  @UseGuards(AdminshipGuard)
  async unmuteMember(
    @Body() body: HandleChannelDto,
    @CurrentChannel() channel: Channel
  ): Promise<Channel> {
    const memberToUnmuteId: string = body.userId
    return await this.channelsService.unmuteMember(channel, memberToUnmuteId)
  }

  @Delete('/:channelId/unset-admin')
  @ApiOperation({
    summary: 'Unset a user as admin of a group',
    operationId: 'unsetAdmin',
    description: 'Unset a user as admin of a group',
    tags: ['chat']
  })
  @UseGuards(GroupGuard)
  @UseGuards(OwnershipGuard)
  async unsetAdmin(
    @Body() body: HandleChannelDto,
    @CurrentChannel() channel: Channel
  ): Promise<Channel> {
    const userToDemoteId: string = body.userId
    return this.channelsService.unsetAdmin(userToDemoteId, channel)
  }
}
