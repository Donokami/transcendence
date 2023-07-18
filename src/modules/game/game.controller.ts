import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  UseGuards
} from '@nestjs/common'
import { GameService } from './game.service'

import { RequestWithUser } from '@/core/types/request-with-user'

import { AuthGuard } from '@/core/guards/auth.guard'
import { OwnershipGuard } from './guards/ownership.guard'

import { CreateGameDto } from './dtos/create-game-dto'
import { UpdateGameDto } from './dtos/update-game-dto'
import { Paginate, PaginateQuery, Paginated } from 'nestjs-paginate'
import { RoomObject } from './room'
import { RoomError } from '@/core/constants/errors'
import { roomErrorHandler } from './utils/game-errors-handler'

@Controller('games')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  // ******* //
  // findOne //
  // ******* //

  @Get(':id')
  @UseGuards(AuthGuard)
  async findOne(@Param('id') id: string) {
    const { data } = await this.gameService.findOne(id)

    if (!data) {
      throw new NotFoundException(`There is no game under id ${id}`)
    }

    return data
  }

  // ******* //
  // findAll //
  // ******* //

  @Get()
  @UseGuards(AuthGuard)
  async findAll(
    @Paginate() query: PaginateQuery
  ): Promise<Paginated<RoomObject>> {
    const { data } = await this.gameService.findAll(query)

    return data
  }

  // ****** //
  // create //
  // ****** //

  @Post()
  @UseGuards(AuthGuard)
  async create(
    @Req() req: RequestWithUser,
    @Body() createGameDto: CreateGameDto
  ): Promise<RoomObject> {
    createGameDto.owner = req.session.userId
    const { data: room, error } = await this.gameService.create(createGameDto)

    if (error) {
      roomErrorHandler(error)
    }

    return room
  }

  // ****** //
  // update //
  // ****** //

  @Patch(':id')
  @UseGuards(AuthGuard)
  @UseGuards(OwnershipGuard)
  async update(@Param('id') id: string, @Body() updateGameDto: UpdateGameDto) {
    const { data, error } = await this.gameService.update(id, updateGameDto)

    if (error) {
      switch (error.code) {
        case RoomError.NOT_FOUND:
          throw new NotFoundException(`There is no room under id ${id}`)
        case RoomError.NOT_OWNER:
          throw new BadRequestException(`You are not the owner of room ${id}`)
        case RoomError.ALREADY_EXISTS:
          throw new BadRequestException(
            `A room with name ${updateGameDto.name} already exists`
          )
        default:
          throw new BadRequestException(error.message)
      }
    }

    // this.gameGateway.server.to(room.id).emit('room:remove', room.get())
  }

  // ****** //
  // remove //
  // ****** //

  @Delete(':id')
  @UseGuards(AuthGuard)
  @UseGuards(OwnershipGuard)
  async remove(@Param('id') id: string) {
    return await this.gameService.delete(id)
  }
}
