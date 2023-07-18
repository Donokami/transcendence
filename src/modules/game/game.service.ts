import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  forwardRef
} from '@nestjs/common'

import { UsersService } from '@/modules/users/users.service'

import { type CreateGameDto } from './dtos/create-game-dto'
import { type UpdateGameDto } from './dtos/update-game-dto'
import { GameGateway } from './game.gateway'

import { Room, type RoomObject } from './room'
import { PaginateQuery, Paginated } from 'nestjs-paginate'
import { paginate } from '@/core/utils/pagination'
import { response, type ServiceResponse } from '@/core/utils/response'
import { RoomError } from '@/core/constants/errors'

@Injectable()
export class GameService {
  private readonly rooms: Room[] = []

  constructor(
    private readonly userService: UsersService,
    @Inject(forwardRef(() => GameGateway))
    private readonly gameGateway: GameGateway
  ) {}

  private readonly logger = new Logger(GameService.name)

  async findOne(id: string): Promise<ServiceResponse<Room>> {
    return response(this.rooms.find((room) => room.get().id === id))
  }

  async findAll(
    query: PaginateQuery
  ): Promise<ServiceResponse<Promise<Paginated<RoomObject>>>> {
    return response(
      paginate(
        query,
        this.rooms.map((room) => room.get())
      )
    )
  }

  // todo: create a function to retrieve all rooms that are not full and another public

  async create(
    createGameDto: CreateGameDto
  ): Promise<ServiceResponse<RoomObject>> {
    const user = await this.userService.findOneById(
      createGameDto.owner as unknown as string
    )

    if (!user) {
      this.logger.warn(`User ${createGameDto.owner} not found`)
      return response(null, {
        message: `There is no user under id ${createGameDto.owner}`,
        code: RoomError.NOT_FOUND
      })
    }

    if (
      this.rooms.find(
        (g) => g.get().name === createGameDto.name || user.username + "'s room"
      )
    ) {
      this.logger.warn(`A room with name ${createGameDto.name} already exists`)
      return response(null, {
        message: `A room with name ${createGameDto.name} already exists`,
        code: RoomError.ALREADY_EXISTS
      })
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

    return response(room.get())
  }

  async update(
    id: string,
    updateGameDto: UpdateGameDto
  ): Promise<ServiceResponse<RoomObject>> {
    const { data: room, error } = await this.findOne(id)

    if (error) {
      if (error.code === RoomError.NOT_FOUND) {
        this.logger.warn(`Room ${id} not found`)
      }
      return response(null, error)
    }

    const updatedGame: RoomObject = { ...room.get(), ...updateGameDto }

    room.update(updatedGame)

    this.logger.verbose(`Updating room ${id}`)

    return response(updatedGame)
  }

  async delete(id: string): Promise<ServiceResponse<RoomObject>> {
    const { data: room, error } = await this.findOne(id)

    if (error) {
      if (error.code === RoomError.NOT_FOUND) {
        this.logger.warn(`Room ${id} not found`)
      }
      return response(null, error)
    }

    this.logger.verbose(`Removing room ${id}`)

    this.gameGateway.server.to(room.id).emit('room:remove', room.get())

    return response(room.get())
  }

  async join(id: string, userId: string): Promise<ServiceResponse<RoomObject>> {
    const { data: room, error } = await this.findOne(id)
    const user = await this.userService.findOneById(userId)

    if (error) {
      if (error.code === RoomError.NOT_FOUND) {
        this.logger.warn(`Room ${id} not found`)
      }
      return response(null, error)
    }

    try {
      room.join(user)
    } catch (error) {
      return response(null, error) // todo: to test
    }

    this.logger.verbose(`Joining user ${userId} to room ${id}`)

    this.gameGateway.server.to(room.id).emit('room:update', room.get())

    return response(room.get())
  }

  // todo: rewrite theses functions
  async kick(id: string, userId: string): Promise<ServiceResponse<RoomObject>> {
    const { data, error } = await this.leave(id, userId)

    this.logger.verbose(`Kicking user ${userId} from room ${id}`)

    this.gameGateway.server.to(id).emit('room:kick', {
      userId
    })

    return response(data)
  }

  async leaveAll(userId: string) {
    const user = await this.userService.findOneById(userId)
    this.rooms.forEach((room) => {
      this.leave(room.id, user.id)
    })
  }

  // todo: crappy code, to clean up and secure
  async leave(
    id: string,
    userId: string
  ): Promise<ServiceResponse<RoomObject>> {
    const { data: room } = await this.findOne(id)
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

        this.gameGateway.server.emit('room:delete', {
          id: room.id
        })

        return room.get()
      }, 5000)
    }

    this.gameGateway.server.to(room.id).emit('room:update', room.get())

    this.logger.verbose(`Removing user ${userId} from room ${id}`)

    return response(room.get())
  }
}
