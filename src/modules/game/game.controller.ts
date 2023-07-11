import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { GameService } from './game.service';

import { RequestWithUser } from '@/core/types/request-with-user';

import { CreateGameDto } from './dtos/create-game-dto';
import { UpdateGameDto } from './dtos/update-game-dto';
import { OwnershipGuard } from './guards/ownership.guard';
import { AuthGuard } from '@/core/guards/auth.guard';
import { PaginationDTO } from '@/core/dtos/pagination.dto';

@Controller('games')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Get(':id')
  @UseGuards(AuthGuard)
  async findOne(@Param('id') id: string) {
    const game = await this.gameService.findOne(id);

    if (!game) {
      throw new NotFoundException(`There is no game under id ${id}`);
    }

    return game;
  }

  @Get()
  @UseGuards(AuthGuard)
  async findAll(
    @Query(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        forbidNonWhitelisted: true,
      }),
    )
    query: PaginationDTO,
  ) {
    return await this.gameService.findAll({
      limit: Number(query.limit) || 10,
      page: Number(query.page) || 1,
    });
  }

  @Post()
  @UseGuards(AuthGuard)
  async create(
    @Req() req: RequestWithUser,
    @Body() createGameDto: CreateGameDto,
  ) {
    createGameDto.owner = req.session.userId;
    return await this.gameService.create(createGameDto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @UseGuards(OwnershipGuard)
  async update(@Param('id') id: string, @Body() updateGameDto: UpdateGameDto) {
    return await this.gameService.update(id, updateGameDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @UseGuards(OwnershipGuard)
  async remove(@Param('id') id: string) {
    return await this.gameService.remove(id);
  }
}
