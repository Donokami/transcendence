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

import { AuthGuard } from '@/core/guards/auth.guard';
import { OwnershipGuard } from './guards/ownership.guard';

import { CreateGameDto } from './dtos/create-game-dto';
import { PaginationDTO } from '@/core/dtos/pagination.dto';
import { UpdateGameDto } from './dtos/update-game-dto';

@Controller('games')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  // ******* //
  // findOne //
  // ******* //

  @Get(':id')
  @UseGuards(AuthGuard)
  async findOne(@Param('id') id: string) {
    const game = await this.gameService.findOneWithRelations(id);

    if (!game) {
      throw new NotFoundException(`There is no game under id ${id}`);
    }

    return game;
  }

  // ******* //
  // findAll //
  // ******* //

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
    return this.gameService.findAll({
      limit: Number(query.limit) || 10,
      page: Number(query.page) || 1,
    });
  }

  // ****** //
  // create //
  // ****** //

  @Post()
  @UseGuards(AuthGuard)
  async create(
    @Req() req: RequestWithUser,
    @Body() createGameDto: CreateGameDto,
  ) {
    createGameDto.owner = req.session.userId;
    return this.gameService.create(createGameDto);
  }

  // ****** //
  // update //
  // ****** //

  @Patch(':id')
  @UseGuards(AuthGuard)
  @UseGuards(OwnershipGuard)
  async update(@Param('id') id: string, @Body() updateGameDto: UpdateGameDto) {
    return this.gameService.update(id, updateGameDto);
  }

  // ****** //
  // remove //
  // ****** //

  @Delete(':id')
  @UseGuards(AuthGuard)
  @UseGuards(OwnershipGuard)
  async remove(@Param('id') id: string) {
    return this.gameService.remove(id);
  }

  // **** //
  // join //
  // **** //

  @Post(':id/join')
  @UseGuards(AuthGuard)
  async join(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.gameService.join(id, req.session.userId);
  }

  // ***** //
  // leave //
  // ***** //

  @Post(':id/leave')
  @UseGuards(AuthGuard)
  async leave(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.gameService.leave(id, req.session.userId);
  }

  // **** //
  // kick //
  // **** //

  @Post(':id/kick/:userId')
  @UseGuards(AuthGuard)
  @UseGuards(OwnershipGuard)
  async kick(@Param('id') id: string, @Param('userId') userId: string) {
    return this.gameService.kick(id, userId);
  }
}
