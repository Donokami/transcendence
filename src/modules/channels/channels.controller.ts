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

import { ChannelsService } from './channels.service';
import { CreateChannelDto } from './dtos/create-channel.dto';
import { UpdateChannelDto } from './dtos/update-channel.dto';

import { RequestWithUser } from '@/core/types/request-with-user';
import { OwnershipGuard } from './guards/ownership.guard';

@Controller('channels')
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.channelsService.findOne(id);
  }

  @Get()
  async findAll() {
    return await this.channelsService.findAll();
  }

  @Post()
  async create(
    @Req() req: RequestWithUser,
    @Body() createChannelDto: CreateChannelDto,
  ) {
    createChannelDto.ownerId = req.user.id;
    return await this.channelsService.create(createChannelDto);
  }

  @UseGuards(OwnershipGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateChannelDto: UpdateChannelDto,
  ) {
    return await this.channelsService.update(id, updateChannelDto);
  }

  @UseGuards(OwnershipGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.channelsService.remove(id);
  }
}
