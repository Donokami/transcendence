import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  forwardRef
} from '@nestjs/common'

import { UsersService } from '@/modules/users/users.service'

import { type UpdateGameDto } from './dtos/update-game-dto'
import { GameGateway } from './game.gateway'

import { Room, type RoomObject } from './room'
import {
  UserNotFound,
  RoomAlreadyExists,
  RoomNotFound,
  UserNotInRoom,
  UserAlreadyInARoom,
  RoomNameCannotBeEmpty,
  GameNotStarted
} from '@/core/exceptions'

@Injectable()
export class GameService {
  private readonly rooms: Room[] = []

  constructor(
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => GameGateway))
    private readonly gameGateway: GameGateway
  ) {}

  private readonly logger = new Logger(GameService.name)

  findOne(id: string): Room {
    return this.rooms.find((room) => room.get().id === id)
  }

  findAll(): RoomObject[] {
    // return paginate(
    //   query,
    //   this.rooms.map((room) => room.get())
    // )
    return this.rooms.map((room) => room.get())
  }

  findPublic(): RoomObject[] {
    return this.rooms
      .filter((room) => !room.get().isPrivate && room.players.length !== 2)
      .map((room) => room.get())
  }

  async joinQueue(userId: string): Promise<RoomObject> {
    const rooms = this.findPublic()

    if (!rooms.length) {
      return this.create(userId)
    }

    return rooms[0]
  }

  public async create(ownerId: string): Promise<RoomObject> {
    const owner = await this.usersService.findOneById(ownerId)

    if (!owner) {
      throw new UserNotFound()
    }

    const roomName = owner.username + "'s room"

    if (this.rooms.find((g) => g.get().name === roomName)) {
      throw new RoomAlreadyExists()
    }

    if (this.rooms.find((r) => r.players.find((p) => p.id === owner.id))) {
      throw new UserAlreadyInARoom()
    }

    const room = new Room(
      {
        name: roomName,
        owner: owner,
        isPrivate: false
      },
      this.gameGateway,
      this.usersService
    )

    this.rooms.push(room)

    return room.get()
  }

  public async update(
    id: string,
    updateGameDto: UpdateGameDto
  ): Promise<RoomObject> {
    const room = this.findOne(id)

    if (!room) {
      throw new RoomNotFound()
    }

    const updatedGame: RoomObject = { ...room.get(), ...updateGameDto }

    if (updatedGame.name === '') {
      throw new RoomNameCannotBeEmpty()
    }

    if (updatedGame.isPrivate === null || updatedGame.isPrivate === undefined) {
      throw new BadRequestException('invalid isPrivate parameter')
    }

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

  public async join(
    id: string,
    userId: string,
    socketId: string
  ): Promise<RoomObject> {
    const room = this.findOne(id)
    const user = await this.usersService.findOneById(userId)

    if (!room) {
      throw new RoomNotFound()
    }

    if (!user) {
      this.logger.warn(`User ${userId} not found`)
      throw new UserNotFound()
    }

    if (this.rooms.find((r) => r.players.find((p) => p.id === user.id))) {
      throw new UserAlreadyInARoom()
    }

    room.join(user, socketId)

    this.logger.verbose(`Joining user ${userId} to room ${id}`)

    this.gameGateway.server.to(room.id).emit('room:update', room.get())

    return room.get()
  }

  // todo: rewrite theses functions
  public async kick(id: string, userId: string): Promise<void> {
    this.leave(id, userId)

    this.logger.verbose(`Kicking user ${userId} from room ${id}`)

    return
  }

  public async leaveAll(userId: string) {
    const user = await this.usersService.findOneById(userId)
    this.rooms.forEach((room) => {
      this.leave(room.id, user.id)
    })
  }

  // todo: maybe not that crappy but not sure about that
  public async leave(id: string, userId: string): Promise<void> {
    const room = this.findOne(id)
    const user = await this.usersService.findOneById(userId)

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

        return
      }, 5000)
    }

    this.gameGateway.server.to(room.id).emit('room:update', room.get())

    this.logger.verbose(`Removing user ${userId} from room ${id}`)
  }

  public async socketLeave(socketId: string): Promise<void> {
    const connectedRooms = this.rooms.filter(
      (r) => r.connectedSockets.get(socketId) !== undefined
    )
    if (connectedRooms.length === 0) return
    connectedRooms.forEach((room) => {
      this.leave(room.id, room.connectedSockets.get(socketId))
      room.connectedSockets.delete(socketId)
    })
  }

  public async updatePos(
    posX: number,
    userId: string,
    roomId: string
  ): Promise<void> {
    const room = this.findOne(roomId)
    const user = await this.usersService.findOneById(userId)

    if (!room) throw new RoomNotFound()
    if (!user) throw new UserNotFound()
    if (!room.players.find((p) => p.id === user.id)) throw new UserNotInRoom()
    if (!room.gameState) throw new GameNotStarted()

    room.gameState.updatePaddlePosition(posX, user.id)
  }
}
