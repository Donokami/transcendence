import {
  BadRequestException,
  HttpException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { UsersService } from '@/modules/users/users.service';

import { Game, RoomStatus } from './entities/game.entity';

import { CreateGameDto } from './dtos/create-game-dto';
import { UpdateGameDto } from './dtos/update-game-dto';
import { Pagination } from '@/core/types/pagination';
import { GameGateway } from './game.gateway';

import { MAX_PLAYERS } from '@/core/constants';

// todo: maybe delete all games after restart

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(Game)
    private readonly gameRepository: Repository<Game>,
    private readonly userService: UsersService,
    @Inject(forwardRef(() => GameGateway))
    private gameGateway: GameGateway,
  ) { }

  private logger = new Logger(GameService.name);

  async findOne(id: string) {
    if (!id) {
      return null;
    }
    const game = await this.gameRepository.findOne({
      where: { id },
      relations: ['owner'],
    });

    return game;
  }

  async findAll({ limit = 10, page = 1 }: Pagination) {
    const games = await this.gameRepository.find({
      take: limit,
      skip: limit * (page - 1),
      relations: ['owner', 'players'],
    });

    return games;
  }

  // todo: create a function to retrieve all games that are not full and another public

  async findOneWithRelations(id: string) {
    const game = await this.gameRepository.findOne({
      where: { id },
      relations: ['owner', 'players'],
    });

    if (!game) {
      this.logger.warn(`Game ${id} not found`);
      throw new NotFoundException(`There is no game under id ${id}`);
    }

    return game;
  }

  async create(createGameDto: CreateGameDto) {
    const user = await this.userService.findOneById(
      createGameDto.owner as unknown as string,
    );

    if (!user) {
      this.logger.warn(`User ${createGameDto.owner} not found`);
      throw new NotFoundException(
        `There is no user under id ${createGameDto.owner}`,
      );
    }

    const game = this.gameRepository.create({
      ...createGameDto,
      players: [user],
    });

    await this.gameRepository.save(game).catch((err) => {
      if (err.code === '23505' || 'SQLITE_CONSTRAINT') {
        this.logger.warn(`A game with name ${game.name} already exists`);
        throw new BadRequestException(
          `A game with name ${game.name} already exists`,
        );
      }
      throw new HttpException(err, 500);
    });

    this.gameGateway.server.emit('game:create', game);

    return game;
  }

  async update(id: string, updateGameDto: UpdateGameDto) {
    const game = await this.gameRepository.preload({
      id,
      ...updateGameDto,
    });

    if (!game) {
      this.logger.warn(`Game ${id} not found`);
      throw new NotFoundException(`There is no game under id ${id}`);
    }

    this.gameGateway.server.to(game.id).emit('game:update', game);

    return this.gameRepository.save(game);
  }

  async remove(id: string) {
    const game = await this.findOne(id);

    this.logger.verbose(`Removing game ${game.id}`);

    return this.gameRepository.remove(game);
  }

  async join(id: string, userId: string) {
    const game = await this.findOneWithRelations(id);
    const user = await this.userService.findOneById(userId);

    // todo: check if game is private

    if (game.players.find((u) => u.id === user.id)) {
      this.logger.warn(`User ${userId} already joined game ${id}`);
      throw new BadRequestException('User already joined');
    }

    if (game.players.length >= MAX_PLAYERS) {
      this.logger.warn(`Game ${id} is full`);
      throw new BadRequestException(`Game ${id} is full`);
    }

    // todo: add spectator role

    game.players.push(user);

    if (game.players.length === MAX_PLAYERS) {
      game.status = RoomStatus.FULL;
    }

    this.logger.verbose(`Joining user ${userId} to game ${id}`);

    this.gameGateway.server.to(game.id).emit('game:update', game);

    return this.gameRepository.save(game);
  }

  async kick(id: string, userId: string) {
    const data = this.leave(id, userId);

    this.logger.verbose(`Kicking user ${userId} from game ${id}`);

    this.gameGateway.server.to(id).emit('game:kick', {
      userId,
    });

    return data;
  }

  async leave(id: string, userId: string) {
    let game = await this.findOneWithRelations(id);
    const user = await this.userService.findOneById(userId);

    if (!game.players.find((u) => u.id === user.id)) {
      this.logger.warn(`User ${userId} not joined game ${id}`);
      throw new BadRequestException('User not joined');
    }

    game.players = game.players.filter((u) => u.id !== user.id);

    if (game.players.length === 0) {
      setTimeout(async () => {
        game = await this.findOneWithRelations(id);
        if (game.players.length > 0) {
          return;
        }

        this.logger.verbose(`Removing game ${id} because no players left`);
        this.gameGateway.server.emit('game:delete', {
          id: game.id,
        });
        return this.gameRepository.remove(game);
      }, 5000);
    }

    if (game.owner.id === user.id) {
      game.owner = game.players[0];
    }

    if (game.players.length < MAX_PLAYERS) {
      game.status = RoomStatus.OPEN;
    }

    this.gameGateway.server.to(game.id).emit('game:update', game);

    this.logger.verbose(`Removing user ${userId} from game ${id}`);

    return this.gameRepository.save(game);
  }
}
