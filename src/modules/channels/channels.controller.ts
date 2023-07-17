import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe
} from '@nestjs/common'

import { AuthGuard } from '@/core/guards/auth.guard'
import { RequestWithUser } from '@/core/types/request-with-user'

import { ChannelsService } from './channels.service'

import { CreateChannelDto } from './dtos/create-channel.dto'

@Controller('channels')
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  // ****** //
  // LOGGER //
  // ****** //

  private logger = new Logger(ChannelsController.name)

  // *************** //
  // createDmChannel //
  // *************** //

  @Post('/create-dm')
  @UseGuards(AuthGuard)
  async createDmChannel(@Body() body: CreateChannelDto) {
    try {
      const dmChannel = await this.channelsService.createDmChannel(body)
      return dmChannel
    } catch (error) {
      throw error
    }
  }

  // ********* //
  // getDmList //
  // ********* //

  @Get('/:id/dm-list')
  @UseGuards(AuthGuard)
  async getDmList(@Param('id') id: string) {
    const dmList = await this.channelsService.getDmList(id)
    return dmList
  }

  // ******************** //
  // getGroupChannelsList //
  // ******************** //

  @Get('/:id/group-channels-list')
  @UseGuards(AuthGuard)
  async getGroupChannelsList(@Param('id') id: string) {
    const groupChannelsList = await this.channelsService.getGroupChannelsList(
      id
    )
    return groupChannelsList
  }

  // @Get(':id')
  // async findOne(@Param('id') id: string) {
  //   return this.channelsService.findOne(id);
  // }

  // @Get()
  // async findAll() {
  //   return this.channelsService.findAll();
  // }

  // @Post()
  // async create(
  //   @Req() req: RequestWithUser,
  //   @Body() createChannelDto: CreateChannelDto,
  // ) {
  //   createChannelDto.owner.id = req.user.id;
  //   return this.channelsService.create(createChannelDto);
  // }

  // @UseGuards(OwnershipGuard)
  // @Patch(':id')
  // async update(
  //   @Param('id') id: string,
  //   @Body() updateChannelDto: UpdateChannelDto,
  // ) {
  //   return this.channelsService.update(id, updateChannelDto);
  // }

  // @UseGuards(OwnershipGuard)
  // @Delete(':id')
  // async remove(@Param('id') id: string) {
  //   return this.channelsService.remove(id);
  // }
}
