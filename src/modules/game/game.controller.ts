import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common'
import { GameService } from './game.service'

import { RequestWithUser } from '@/core/types/request-with-user'

import { AuthGuard } from '@/core/guards/auth.guard'
import { OwnershipGuard } from './guards/ownership.guard'

import { CreateGameDto } from './dtos/create-game-dto'
import { UpdateGameDto } from './dtos/update-game-dto'

@Controller('games')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  // ******* //
  // findOne //
  // ******* //

  @Get(':id')
  @UseGuards(AuthGuard)
  async findOne(@Param('id') id: string) {
    const game = await this.gameService.findOne(id)

    if (!game) {
      throw new NotFoundException(`There is no game under id ${id}`)
    }

    return game
  }

  // ******* //
  // findAll //
  // ******* //

  @Get()
  @UseGuards(AuthGuard)
  async findAll() {
    return await this.gameService.findAll()
  }

  // ****** //
  // create //
  // ****** //

  @Post()
  @UseGuards(AuthGuard)
  async create(
    @Req() req: RequestWithUser,
    @Body() createGameDto: CreateGameDto
  ) {
    createGameDto.owner = req.session.userId
    return await this.gameService.create(createGameDto)
  }

  // ****** //
  // update //
  // ****** //

  @Patch(':id')
  @UseGuards(AuthGuard)
  @UseGuards(OwnershipGuard)
  async update(@Param('id') id: string, @Body() updateGameDto: UpdateGameDto) {
    return await this.gameService.update(id, updateGameDto)
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
