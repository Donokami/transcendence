import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { UsersService } from '@/modules/users/users.service';

import { Game } from './entities/game.entity';

import { CreateGameDto } from './dtos/create-game-dto';
import { UpdateGameDto } from './dtos/update-game-dto';
import { Pagination } from '@/core/types/pagination';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(Game)
    private readonly gameRepository: Repository<Game>,
    @InjectRepository(Game)
    private readonly userService: UsersService,
  ) { }

  async findOne(id: string) {
    const game = await this.gameRepository.findOneBy({ id });

    if (!game) {
      throw new NotFoundException(`There is no game under id ${id}`);
    }

    return game;
  }

  async findAll({ limit = 10, page = 1 }: Pagination) {
    console.log(limit, page);
    const games = await this.gameRepository.find({
      take: limit,
      skip: limit * (page - 1),
    });

    return games;
  }

  async findOneWithRelations(id: string) {
    const game = await this.gameRepository.findOneBy({ id });

    if (!game) {
      throw new NotFoundException(`There is no game under id ${id}`);
    }

    return game;
  }

  async create(createGameDto: CreateGameDto) {
    const newGame = this.gameRepository.create({
      ...createGameDto,
    });

    const game = await this.gameRepository.save(newGame);

    return game;
  }

  async update(id: string, updateGameDto: UpdateGameDto) {
    const game = await this.gameRepository.preload({
      id,
      ...updateGameDto,
    });

    if (!game) {
      throw new NotFoundException(`There is no game under id ${id}`);
    }

    return this.gameRepository.save(game);
  }

  async remove(id: string) {
    const game = await this.findOne(id);

    return this.gameRepository.remove(game);
  }
}
