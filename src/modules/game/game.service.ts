import {
  BadRequestException,
  HttpException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  forwardRef
} from '@nestjs/common'

import { UsersService } from '@/modules/users/users.service'

import { type CreateGameDto } from './dtos/create-game-dto'
import { type UpdateGameDto } from './dtos/update-game-dto'
import { type Pagination } from '@/core/types/pagination'
import { GameGateway } from './game.gateway'

import { Room, type RoomObject } from './room'

@Injectable()
export class GameService {
  private readonly rooms: Room[] = []

  constructor(
    private readonly userService: UsersService,
    @Inject(forwardRef(() => GameGateway))
    private readonly gameGateway: GameGateway
  ) {}

  private readonly logger = new Logger(GameService.name)

  async findOne(id: string) {
    return this.rooms.find((room) => room.get().id === id)
  }

  async findAll({ limit = 10, page = 1 }: Pagination) {
    return this.rooms
      .slice((page - 1) * limit, page * limit)
      .map((g) => g.get())
  }

  // todo: create a function to retrieve all rooms that are not full and another public

  async create(createGameDto: CreateGameDto) {
    const user = await this.userService.findOneById(
      createGameDto.owner as unknown as string
    )

    if (!user) {
      this.logger.warn(`User ${createGameDto.owner} not found`)
      throw new NotFoundException(
        `There is no user under id ${createGameDto.owner}`
      )
    }

    if (this.rooms.find((g) => g.get().name === createGameDto.name)) {
      this.logger.warn(`A room with name ${createGameDto.name} already exists`)
      throw new BadRequestException(
        `A room with name ${createGameDto.name} already exists`
      )
    }

    const room = new Room(
      {
        name: createGameDto.name,
        owner: user,
        isPrivate: createGameDto.isPrivate
      },
      this.gameGateway
    )

    this.rooms.push(room)

    this.gameGateway.server.emit('game:create', room.get())

    return room.get()
  }

  async update(id: string, updateGameDto: UpdateGameDto) {
    const room = await this.findOne(id)

    if (!room) {
      this.logger.warn(`Room ${id} not found`)
      throw new NotFoundException(`There is no room under id ${id}`)
    }

    const updatedGame: RoomObject = { ...room.get(), ...updateGameDto }

    room.update(updatedGame)

    this.logger.verbose(`Updating room ${id}`)

    return updatedGame
  }

  async remove(id: string) {
    const room = await this.findOne(id)

    if (!room) {
      this.logger.warn(`Room ${id} not found`)
      throw new NotFoundException(`There is no room under id ${id}`)
    }

    this.logger.verbose(`Removing room ${id}`)

    this.gameGateway.server.to(room.id).emit('game:remove', room.get())

    return room.get()
  }

  async join(id: string, userId: string) {
    const room = await this.findOne(id)
    const user = await this.userService.findOneById(userId)

    try {
      room.join(user)
    } catch (error) {
      throw new HttpException(error.message, 400)
    }

    this.logger.verbose(`Joining user ${userId} to room ${id}`)

    this.gameGateway.server.to(room.id).emit('game:update', room.get())

    return room.get()
  }

  async kick(id: string, userId: string) {
    const data = this.leave(id, userId)

    this.logger.verbose(`Kicking user ${userId} from room ${id}`)

    this.gameGateway.server.to(id).emit('game:kick', {
      userId
    })

    return await data
  }

  async leave(id: string, userId: string) {
    const room = await this.findOne(id)
    const user = await this.userService.findOneById(userId)

    if (!room) {
      this.logger.warn(`Game ${id} not found`)
      throw new NotFoundException(`There is no room under id ${id}`)
    }

    if (!user) {
      this.logger.warn(`User ${userId} not found`)
      throw new NotFoundException(`There is no user under id ${userId}`)
    }

    room.leave(user)

    if (room.players.length === 0) {
      setTimeout(() => {
        if (room.players.length > 0) {
          return
        }

        this.logger.verbose(`Removing room ${user.id} because no players left`)

        this.rooms.splice(this.rooms.indexOf(room), 1)

        this.gameGateway.server.emit('game:delete', {
          id: room.id
        })

        if (room.owner.id === user.id) {
          room.owner = room.players[0]
        }

        return room.get()
      }, 5000)
    }

    this.gameGateway.server.to(room.id).emit('game:update', room.get())

    this.logger.verbose(`Removing user ${userId} from room ${id}`)

    return room.get()
  }
}
