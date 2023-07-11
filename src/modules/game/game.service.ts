import {
  BadRequestException,
  HttpException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';

import { UsersService } from '@/modules/users/users.service';

import { type CreateGameDto } from './dtos/create-game-dto';
import { type UpdateGameDto } from './dtos/update-game-dto';
import { type Pagination } from '@/core/types/pagination';
import { GameGateway } from './game.gateway';

import { Room, type RoomObject } from './room';

@Injectable()
export class GameService {
  private readonly games: Room[] = [];

  constructor(
    private readonly userService: UsersService,
    @Inject(forwardRef(() => GameGateway))
    private readonly gameGateway: GameGateway,
  ) {}

  private readonly logger = new Logger(GameService.name);

  async findOne(id: string) {
    return this.games.find((game) => game.getRoom().id === id);
  }

  async findAll({ limit = 10, page = 1 }: Pagination) {
    return this.games
      .slice((page - 1) * limit, page * limit)
      .map((g) => g.getRoom());
  }

  // todo: create a function to retrieve all games that are not full and another public

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

    if (this.games.find((g) => g.getRoom().name === createGameDto.name)) {
      this.logger.warn(`A game with name ${createGameDto.name} already exists`);
      throw new BadRequestException(
        `A game with name ${createGameDto.name} already exists`,
      );
    }

    const game = new Room({
      name: createGameDto.name,
      owner: user,
      isPrivate: createGameDto.isPrivate,
    });

    this.games.push(game);

    this.gameGateway.server.emit('game:create', game.getRoom());

    return game.getRoom();
  }

  async update(id: string, updateGameDto: UpdateGameDto) {
    const game = await this.findOne(id);

    if (!game) {
      this.logger.warn(`Game ${id} not found`);
      throw new NotFoundException(`There is no game under id ${id}`);
    }

    const updatedGame: RoomObject = { ...game.getRoom(), ...updateGameDto };

    game.update(updatedGame);

    this.logger.verbose(`Updating game ${id}`);

    this.gameGateway.server
      .to(game.getRoom().id)
      .emit('game:update', updatedGame);

    return updatedGame;
  }

  async remove(id: string) {
    const game = await this.findOne(id);

    if (!game) {
      this.logger.warn(`Game ${id} not found`);
      throw new NotFoundException(`There is no game under id ${id}`);
    }

    this.logger.verbose(`Removing game ${id}`);

    this.gameGateway.server
      .to(game.getRoom().id)
      .emit('game:remove', game.getRoom());

    return game.getRoom();
  }

  async join(id: string, userId: string) {
    const game = await this.findOne(id);
    const user = await this.userService.findOneById(userId);

    // todo: check if game is private

    try {
      game.join(user);
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }

    // todo: add spectator role

    this.logger.verbose(`Joining user ${userId} to game ${id}`);

    this.gameGateway.server
      .to(game.getRoom().id)
      .emit('game:update', game.getRoom());

    return game.getRoom();
  }

  async kick(id: string, userId: string) {
    const data = this.leave(id, userId);

    this.logger.verbose(`Kicking user ${userId} from game ${id}`);

    this.gameGateway.server.to(id).emit('game:kick', {
      userId,
    });

    return await data;
  }

  async leave(id: string, userId: string) {
    const game = await this.findOne(id);
    const user = await this.userService.findOneById(userId);

    if (!game) {
      this.logger.warn(`Game ${id} not found`);
      throw new NotFoundException(`There is no game under id ${id}`);
    }

    if (!user) {
      this.logger.warn(`User ${userId} not found`);
      throw new NotFoundException(`There is no user under id ${userId}`);
    }

    game.leave(user);

    if (game.getRoom().players.length === 0) {
      setTimeout(() => {
        if (game.getRoom().players.length > 0) {
          return;
        }

        this.logger.verbose(`Removing game ${user.id} because no players left`);

        this.games.splice(this.games.indexOf(game), 1);

        this.gameGateway.server.emit('game:delete', {
          id: game.getRoom().id,
        });

        if (game.getRoom().owner.id === user.id) {
          game.getRoom().owner = game.getRoom().players[0];
        }

        return game.getRoom();
      }, 5000);
    }

    this.gameGateway.server
      .to(game.getRoom().id)
      .emit('game:update', game.getRoom());

    this.logger.verbose(`Removing user ${userId} from game ${id}`);

    return game.getRoom();
  }
}
