import { CreateGameDto } from './dtos/create-game-dto'
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

import { Room, type RoomObject } from './game.room'
import {
  UserNotFound,
  RoomAlreadyExists,
  RoomNotFound,
  UserNotInRoom,
  UserAlreadyInARoom,
  RoomNameCannotBeEmpty,
  GameNotStarted
} from '@/core/exceptions'
import { Match } from './entities/match.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

@Injectable()
export class GameService {
  private readonly rooms: Room[] = []

  constructor(
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => GameGateway))
    private readonly gameGateway: GameGateway,
    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>
  ) {}

  private readonly logger = new Logger(GameService.name)

  public findOne(id: string): Room {
    return this.rooms.find((room) => room.get().id === id)
  }

  public findByOwnerId(ownerId: string): string[] {
    const room = this.rooms.find((room) => room.get().owner.id === ownerId)

    if (!room) return []
    return [room.id]
  }

  public findAll(): RoomObject[] {
    return this.rooms.map((room) => room.get())
  }

  public async findMatches(userId: string): Promise<Match[]> {
    const user = await this.usersService.findOneById(userId)
    if (!user) throw new UserNotFound()

    const matches = await this.matchRepository
      .createQueryBuilder('match')
      .leftJoinAndSelect('match.playerA', 'playerA')
      .leftJoinAndSelect('match.playerB', 'playerB')
      .where(`match.playerAId = :userId OR match.playerBId = :userId`, {
        userId
      })
      .orderBy('match.playedAt', 'DESC')
      .limit(50)
      .getMany()

    return matches
  }

  public findPublic(): RoomObject[] {
    return this.rooms
      .filter((room) => !room.get().isPrivate && room.players.length !== 2)
      .map((room) => room.get())
  }

  public async joinQueue(): Promise<RoomObject[]> {
    const rooms = this.findPublic()

    if (rooms.length === 0) {
      return []
    }
    return [rooms[0]]
  }

  public async create(
    ownerId: string,
    createGameDto: CreateGameDto
  ): Promise<RoomObject> {
    const owner = await this.usersService.findOneById(ownerId)

    if (!owner) {
      throw new UserNotFound()
    }

    const roomName = owner.username + "'s room"

    if (this.rooms.find((g) => g.get().owner.id === owner.id)) {
      throw new RoomAlreadyExists()
    }

    if (this.rooms.find((r) => r.players.find((p) => p.id === owner.id))) {
      throw new UserAlreadyInARoom()
    }

    const room = new Room(
      {
        name: roomName,
        owner: owner,
        isPrivate: createGameDto.isPrivate ?? false
      },
      this.gameGateway,
      this.usersService,
      this.matchRepository
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
      this.logger.verbose(`Removing room ${user.id} because no players left`)

      this.rooms.splice(this.rooms.indexOf(room), 1)

      this.gameGateway.server.emit('room:delete', {
        id: room.id
      })
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
