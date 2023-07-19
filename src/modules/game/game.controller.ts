import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseFilters,
  UseGuards
} from '@nestjs/common'
import { GameService } from './game.service'

import { IRequestWithUser } from '@/core/types/request-with-user'

import { AuthGuard } from '@/core/guards/auth.guard'
import { OwnershipGuard } from './guards/ownership.guard'

import { CreateGameDto } from './dtos/create-game-dto'
import { UpdateGameDto } from './dtos/update-game-dto'
import { Paginate, PaginateQuery, Paginated } from 'nestjs-paginate'
import { RoomObject } from './room'
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger'
import { GlobalExceptionFilter } from '@/core/filters/global-exception.filters'
import { RoomNotFound } from '@/core/exceptions/game'

@Controller('games')
@UseFilters(new GlobalExceptionFilter())
export class GameController {
  constructor(private readonly gameService: GameService) {}

  // ******* //
  // findOne //
  // ******* //

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Get a game by id',
    operationId: 'findOne',
    description: 'Get a game by id',
    tags: ['game']
  })
  // @ApiOkResponse({ type })
  findOne(@Param('id') id: string) {
    const room = this.gameService.findOne(id)

    if (!room) {
      throw new RoomNotFound()
    }

    return room.get()
  }

  // ******* //
  // findAll //
  // ******* //

  @Get()
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Get all games',
    operationId: 'findAll',
    description: 'Get all games',
    tags: ['game']
  })
  findAll(@Paginate() query: PaginateQuery): Promise<Paginated<RoomObject>> {
    return this.gameService.findAll(query)
  }

  // ****** //
  // create //
  // ****** //

  @Post()
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Create a game',
    operationId: 'create',
    description: 'Create a game',
    tags: ['game']
  })
  create(
    @Req() req: IRequestWithUser,
    @Body() createGameDto: CreateGameDto
  ): Promise<RoomObject> {
    createGameDto.owner = req.session.userId
    return this.gameService.create(createGameDto)
  }

  // ****** //
  // update //
  // ****** //

  @Patch(':id')
  @UseGuards(AuthGuard)
  @UseGuards(OwnershipGuard)
  @ApiOperation({
    summary: 'Update a game with given id',
    operationId: 'update',
    description: 'Update a game with given id',
    tags: ['game']
  })
  async update(@Param('id') id: string, @Body() updateGameDto: UpdateGameDto) {
    this.gameService.update(id, updateGameDto)

    // this.gameGateway.server.to(room.id).emit('room:remove', room.get())
  }

  // ****** //
  // remove //
  // ****** //

  @Delete(':id')
  @UseGuards(AuthGuard)
  @UseGuards(OwnershipGuard)
  @ApiOperation({
    summary: 'Delete a game with given id',
    operationId: 'remove',
    description: 'Delete a game with given id',
    tags: ['game']
  })
  async remove(@Param('id') id: string) {
    return await this.gameService.delete(id)
  }
}
