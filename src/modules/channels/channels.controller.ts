import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { RequestWithUser } from '@/core/types/request-with-user';
import { OwnershipGuard } from './guards/ownership.guard';

import { ChannelsService } from './channels.service';
import { CreateChannelDto } from './dtos/create-channel.dto';
import { UpdateChannelDto } from './dtos/update-channel.dto';

@Controller('channels')
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.channelsService.findOne(id);
  }

  @Get()
  async findAll() {
    return this.channelsService.findAll();
  }

  @Post()
  async create(
    @Req() req: RequestWithUser,
    @Body() createChannelDto: CreateChannelDto,
  ) {
    createChannelDto.ownerId = req.user.id;
    return this.channelsService.create(createChannelDto);
  }

  @UseGuards(OwnershipGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateChannelDto: UpdateChannelDto,
  ) {
    return this.channelsService.update(id, updateChannelDto);
  }

  @UseGuards(OwnershipGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.channelsService.remove(id);
  }
}
