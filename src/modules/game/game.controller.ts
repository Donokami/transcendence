import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Session,
  UseFilters,
  UseGuards,
  UseInterceptors
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
import { CreateGameDto } from './dtos/create-game-dto'

@UseGuards(AuthGuard, UsernameGuard)
@UseInterceptors(ClassSerializerInterceptor)
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
  async joinQueue(): Promise<RoomObject[]> {
    return this.gameService.joinQueue()
  }

  @Get('/me')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Get a game by owner id',
    operationId: 'findGame',
    description: 'Get a game by owner id',
    tags: ['game']
  })
  async findGame(@Session() session: ISession): Promise<string[]> {
    return this.gameService.findByOwnerId(session.userId)
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a game by id',
    operationId: 'findOne',
    description: 'Get a game by id',
    tags: ['game']
  })
  async findOne(@Param('id') id: string): Promise<RoomObject> {
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
  async findMatches(@Param('userId') userId: string) {
    return this.gameService.findMatches(userId)
  }

  @Get()
  @ApiOperation({
    summary: 'Get all games',
    operationId: 'findAll',
    description: 'Get all games',
    tags: ['game']
  })
  async findAll(@Session() session: ISession) {
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
  async create(
    @Session() session: ISession,
    @Body() createGameDto: CreateGameDto
  ): Promise<RoomObject> {
    return this.gameService.create(session.userId, createGameDto)
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
}
