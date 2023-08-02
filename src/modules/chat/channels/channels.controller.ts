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

import { AuthGuard } from '@/core/guards/auth.guard'

import { ChannelsService } from './channels.service'

import { CreateChannelDto } from './dtos/create-channel.dto'
import { GetGroupByNameDto } from './dtos/get-group-by-name.dto'
import { JoinGroupDto } from './dtos/join-group.dto'
import { MessageDto } from './dtos/message.dto'
import { GlobalExceptionFilter } from '@/core/filters/global-exception.filters'
import { Channel } from '@/modules/chat/channels/entities/channel.entity'
import { OwnershipGuard } from './guards/ownership.guard'

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
  @UseGuards(AuthGuard)
  // todo : add other guards as necessary
  // @UseGuards(ChatOwnershipGuard)
  async addAdmin(
    @Param('channelId') channelId: string,
    @Body('userId') userId: string
  ): Promise<Channel> {
    return this.channelsService.addAdmin(channelId, userId)
  }

  // ********* //
  // banMember //
  // ********* //

  @Put('/:channelId/ban')
  @UseGuards(AuthGuard)
  // todo : add other guards as necessary
  // @UseGuards(ChatAdminGuard)
  async banMember(
    @Param('channelId') channelId: string,
    @Body('userId') userId: string
  ): Promise<Channel> {
    return this.channelsService.banMember(channelId, userId)
  }

  // *************** //
  // createDmChannel //
  // *************** //

  @Post('/create/dm')
  @UseGuards(AuthGuard)
  async createDmChannel(@Body() body: CreateChannelDto) {
    try {
      const dmChannel = await this.channelsService.createDmChannel(body)
      return dmChannel
    } catch (error) {
      throw error
    }
  }

  // ****************** //
  // createGroupChannel //
  // ****************** //

  @Post('/create/group')
  @UseGuards(AuthGuard)
  async createGroupChannel(@Body() body: CreateChannelDto) {
    try {
      const groupChannel = await this.channelsService.createGroupChannel(body)
      return groupChannel
    } catch (error) {
      throw error
    }
  }

  // *********** //
  // getChannel //
  // *********** //

  @Get('/:id')
  @UseGuards(AuthGuard)
  // todo: add MemberGuard
  async getChannel(@Param('id') id: string) {
    const channel = await this.channelsService.findOne(id)
    return channel
  }

  // ************** //
  // getGroupByName //
  // ************** //

  @Get('/group/:name')
  @UseGuards(AuthGuard)
  async getGroupByName(@Param('name') name: string) {
    const channel = await this.channelsService.findOneByName(name)
    if (!channel)
      throw new NotFoundException(`Group with name ${name} not found`)
    return channel
  }

  // *********** //
  // getMessages //
  // *********** //

  @Get('/:id/messages')
  @UseGuards(AuthGuard)
  // todo: add MemberGuard
  async getMessages(@Param('id') id: string) {
    const messages = await this.channelsService.getMessages(id)

    return messages
  }

  // ********* //
  // joinGroup //
  // ********* //

  @Post('/group/join')
  @UseGuards(AuthGuard)
  async joinGroup(@Body() joinGroupDto: JoinGroupDto, @Session() session: any) {
    const newMemberId = session.id
    return await this.channelsService.joinGroup(joinGroupDto, newMemberId)
  }

  // ********** //
  // kickMember //
  // ********** //

  @Put('/:channelId/kick')
  @UseGuards(AuthGuard)
  // todo : add other guards as necessary
  async kickMember(
    @Param('channelId') channelId: string,
    @Body('userId') userId: string
  ): Promise<Channel> {
    return this.channelsService.kickMember(channelId, userId)
  }

  // ********** //
  // muteMember //
  // ********** //

  @Put('/:channelId/mute')
  @UseGuards(AuthGuard)
  // todo : add other guards as necessary
  async muteMember(
    @Param('channelId') channelId: string,
    @Body('userId') userId: string
  ): Promise<Channel> {
    return this.channelsService.muteMember(channelId, userId)
  }

  // ************ //
  // postMessages //
  // ************ //

  @Post('/:id/messages')
  @UseGuards(AuthGuard)
  // todo: add MemberGuard
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

  @Delete('/:channelId/admins/:userId')
  @UseGuards(AuthGuard)
  // todo: add other guards as necessary
  async removeAdmin(
    @Param('channelId') channelId: string,
    @Param('userId') userId: string
  ): Promise<Channel> {
    return this.channelsService.removeAdmin(channelId, userId)
  }

  // *********** //
  // unBanMember //
  // *********** //

  @Delete('/:channelId/bannedMembers/:userId')
  @UseGuards(AuthGuard)
  // todo: add other guards as necessary
  async unBanMember(
    @Param('channelId') channelId: string,
    @Param('userId') userId: string
  ): Promise<Channel> {
    return this.channelsService.unBanMember(channelId, userId)
  }

  // ************ //
  // unMuteMember //
  // ************ //

  @Delete('/:channelId/mutedMembers/:userId')
  @UseGuards(AuthGuard)
  // todo: add other guards as necessary
  async unMuteMember(
    @Param('channelId') channelId: string,
    @Param('userId') userId: string
  ): Promise<Channel> {
    return this.channelsService.unMuteMember(channelId, userId)
  }
}
