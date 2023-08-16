import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Session,
  UseFilters,
  UseGuards
} from '@nestjs/common'
import { GameService } from './game.service'

import { AuthGuard } from '@/core/guards/auth.guard'
import { OwnershipGuard } from './guards/ownership.guard'
import { UsernameGuard } from '@/core/guards/username.guard'

import { UpdateGameDto } from './dtos/update-game-dto'
import { RoomObject } from './game.room'
import { ApiOperation } from '@nestjs/swagger'
import { GlobalExceptionFilter } from '@/core/filters/global-exception.filters'
import { RoomNotFound } from '@/core/exceptions/game'
import { ISession } from '@/core/types'

@UseGuards(AuthGuard, UsernameGuard)
@Controller('games')
@UseFilters(new GlobalExceptionFilter())
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Get('/matchmaking')
  @ApiOperation({
    summary: 'Join the matchmaking queue',
    operationId: 'joinQueue',
    description: 'Join the matchmaking queue',
    tags: ['game']
  })
  joinQueue(): Promise<RoomObject[]> {
    return this.gameService.joinQueue()
  }

  @Get(':id')
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

  @Get('/matchs/:userId')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Get the matches by userId',
    operationId: 'findMatches',
    description: 'Get the matches by userId',
    tags: ['game']
  })
  findMatches(@Param('userId') userId: string) {
    return this.gameService.findMatches(userId)
  }

  @Get()
  @ApiOperation({
    summary: 'Get all games',
    operationId: 'findAll',
    description: 'Get all games',
    tags: ['game']
  })
  findAll(@Session() session: ISession) {
    return this.gameService
      .findAll()
      .filter((room) => !room.isPrivate || room.owner.id === session.userId)
  }

  @Post()
  @ApiOperation({
    summary: 'Create a game',
    operationId: 'create',
    description: 'Create a game',
    tags: ['game']
  })
  create(@Session() session: ISession): Promise<RoomObject> {
    return this.gameService.create(session.userId)
  }

  @Patch(':id')
  @UseGuards(OwnershipGuard)
  @ApiOperation({
    summary: 'Update a game with given id',
    operationId: 'update',
    description: 'Update a game with given id',
    tags: ['game']
  })
  async update(@Param('id') id: string, @Body() updateGameDto: UpdateGameDto) {
    return this.gameService.update(id, updateGameDto)
  }

  //   @Delete(':id')
  //   @UseGuards(OwnershipGuard)
  //   @ApiOperation({
  //     summary: 'Delete a game with given id',
  //     operationId: 'remove',
  //     description: 'Delete a game with given id',
  //     tags: ['game']
  //   })
  //   async remove(@Param('id') id: string) {
  //     return await this.gameService.delete(id)
  //   }
}
