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

import { AuthGuard } from '@/core/guards/auth.guard';
import { RequestWithUser } from '@/core/types/request-with-user';

import { ChannelsService } from './channels.service';
import { CreateChannelDto } from './dtos/create-channel.dto';
import { UpdateChannelDto } from './dtos/update-channel.dto';
import { OwnershipGuard } from './guards/ownership.guard';

@Controller('channels')
export class ChannelsController {
  constructor(private readonly chatService: ChannelsService) {}

  // ********* //
  // getDmList //
  // ********* //

  @Get('/:id/dm-list')
  @UseGuards(AuthGuard)
  async getDmList(@Param('id') id: string) {
    const dmList = await this.chatService.getDmList(id);
    return dmList;
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
