import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  UseFilters,
  UseGuards
} from '@nestjs/common'

import { AuthGuard } from '@/core/guards/auth.guard'

import { ChannelsService } from './channels.service'

import { CreateChannelDto } from './dtos/create-channel.dto'
import { MessageDto } from './dtos/message.dto'
import { GlobalExceptionFilter } from '@/core/filters/global-exception.filters'

@Controller('channels')
@UseFilters(new GlobalExceptionFilter())
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) { }

  // ****** //
  // LOGGER //
  // ****** //

  private logger = new Logger(ChannelsController.name)

  // *************** //
  // postMessages //
  // *************** //

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
  // getMessages //
  // *********** //

  @Get('/:id/messages')
  @UseGuards(AuthGuard)
  // todo: add MemberGuard
  async getMessages(@Param('id') id: string) {
    const messages = await this.channelsService.getMessages(id)

    return messages
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

  @Post('/create/group-channel')
  @UseGuards(AuthGuard)
  async createGroupChannel(@Body() body: CreateChannelDto) {
    try {
      const groupChannel = await this.channelsService.createGroupChannel(body)
      return groupChannel
    } catch (error) {
      throw error
    }
  }
}
