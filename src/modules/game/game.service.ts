import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common'

import { UsersService } from '@/modules/users/users.service'

import { type CreateGameDto } from './dtos/create-game-dto'
import { type UpdateGameDto } from './dtos/update-game-dto'
import { GameGateway } from './game.gateway'

import { Room, type RoomObject } from './room'
import { PaginateQuery, Paginated } from 'nestjs-paginate'
import { paginate } from '@/core/utils/pagination'
import {
  UserNotFound,
  RoomAlreadyExists,
  RoomNotFound,
  UserNotInRoom
} from '@/core/exceptions'

@Injectable()
export class GameService {
  private readonly rooms: Room[] = []

  constructor(
    private readonly userService: UsersService,
    @Inject(forwardRef(() => GameGateway))
    private readonly gameGateway: GameGateway
  ) {}

  private readonly logger = new Logger(GameService.name)

  findOne(id: string): Room {
    return this.rooms.find((room) => room.get().id === id)
  }

  findAll(query: PaginateQuery): Promise<Paginated<RoomObject>> {
    return paginate(
      query,
      this.rooms.map((room) => room.get())
    )
  }

  // todo: create a function to retrieve all rooms that are not full and another public

  public async create(createGameDto: CreateGameDto): Promise<RoomObject> {
    const user = await this.userService.findOneById(
      createGameDto.owner as unknown as string
    )

    if (!user) {
      this.logger.warn(`User ${createGameDto.owner} not found`)
      throw new UserNotFound()
    }

    if (
      this.rooms.find(
        (g) =>
          g.get().name === (createGameDto.name || user.username + "'s room")
      )
    ) {
      throw new RoomAlreadyExists()
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

    return room.get()
  }

  update(id: string, updateGameDto: UpdateGameDto): RoomObject {
    const room = this.findOne(id)

    if (!room) {
      throw new RoomNotFound()
    }

    const updatedGame: RoomObject = { ...room.get(), ...updateGameDto }

    room.update(updatedGame)

    this.logger.verbose(`Updating room ${id}`)

    return updatedGame
  }

  public async delete(id: string): Promise<RoomObject> {
    const room = this.findOne(id)

    if (!room) {
      throw new RoomNotFound()
    }

    this.logger.verbose(`Removing room ${id}`)

    this.gameGateway.server.to(room.id).emit('room:remove', room.get())

    return room.get()
  }

  public async join(id: string, userId: string): Promise<RoomObject> {
    const room = this.findOne(id)
    const user = await this.userService.findOneById(userId)

    if (!room) {
      throw new RoomNotFound()
    }

    if (!user) {
      this.logger.warn(`User ${userId} not found`)
      throw new UserNotFound()
    }

    room.join(user)

    this.logger.verbose(`Joining user ${userId} to room ${id}`)

    this.gameGateway.server.to(room.id).emit('room:update', room.get())

    return room.get()
  }

  // todo: rewrite theses functions
  public async kick(id: string, userId: string): Promise<RoomObject> {
    const room = this.leave(id, userId)

    this.logger.verbose(`Kicking user ${userId} from room ${id}`)

    this.gameGateway.server.to(id).emit('room:kick', {
      userId
    })

    return room
  }

  public async leaveAll(userId: string) {
    const user = await this.userService.findOneById(userId)
    this.rooms.forEach((room) => {
      this.leave(room.id, user.id)
    })
  }

  // todo: crappy code, to clean up and secure
  public async leave(id: string, userId: string): Promise<RoomObject> {
    const room = this.findOne(id)
    const user = await this.userService.findOneById(userId)

    if (!room) {
      throw new RoomNotFound()
    }

    if (!user) {
      this.logger.warn(`User ${userId} not found`)
      throw new UserNotFound()
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

    return room.get()
  }

  public async updatePos(
    posX: number,
    userId: string,
    roomId: string
  ): Promise<void> {
    const room = this.findOne(roomId)
    const user = await this.userService.findOneById(userId)

    if (!room) throw new RoomNotFound()
    if (!user) throw new UserNotFound()
    if (!room.players.find((p) => p.id === user.id)) throw new UserNotInRoom()

    room.gameState.updatePaddlePosition(posX, user.id)
  }
}
