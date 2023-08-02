import { Logger } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { User } from '../users/user.entity'
import { GameGateway } from './game.gateway'
import { Game } from './game.engine'

export enum RoomStatus {
  OPEN = 'open',
  FULL = 'full',
  INGAME = 'ingame'
}

interface RoomOpts {
  name: string
  owner: User
  isPrivate: boolean
}

export interface RoomObject {
  id: string
  name: string
  players: User[]
  owner: User
  isPrivate: boolean
  paddleRatio: number
  gameDuration: number
  ballSpeed: number
  status: RoomStatus
  gameState?: Game | null
}

export class Room implements RoomObject {
  id = ''
  name = ''
  players = []
  owner = null
  isPrivate = false
  paddleRatio = 0.3
  ballSpeed = 1
  gameDuration = 1.5
  status = RoomStatus.OPEN
  gameState: Game | null = null
  public connectedSockets: Map<string, string> = new Map()

  private readonly logger = new Logger(Room.name)
  constructor(
    { name, owner, isPrivate }: RoomOpts,
    private readonly gameGateway: GameGateway
  ) {
    this.id = randomUUID()

    this.logger.log(`Creating room ${this.id}`)

    this.name = name || `${owner.username}'s room`

    this.isPrivate = isPrivate || false

    this.owner = owner
  }

  public get(): RoomObject {
    return {
      id: this.id,
      name: this.name,
      players: this.players,
      owner: this.owner,
      isPrivate: this.isPrivate,
      paddleRatio: this.paddleRatio,
      ballSpeed: this.ballSpeed,
      gameDuration: this.gameDuration,
      status: this.status
    }
  }

  public join(user: User, socketId: string) {
    if (this.players.length < 2 && this.status === RoomStatus.OPEN) {
      this.players.push(user)

      if (this.players.length === 2) {
        this.status = RoomStatus.FULL
      }
    }
    this.connectedSockets.set(socketId, user.id)
  }

  public leave(user: User) {
    if (this.players.find((u) => u.id === user.id)) {
      this.players = this.players.filter((u) => u.id !== user.id)

      if (this.status === RoomStatus.FULL) {
        this.status = RoomStatus.OPEN
      }
      if (this.status === RoomStatus.INGAME) {
        this.gameState.userSurrended(user.id)
      }
    }
  }

  public update(updatedRoom: RoomObject) {
    Object.assign(this, updatedRoom)

    this.gameGateway.server.to(this.id).emit('room:update', this.get())
    return this.get()
  }

  public startGame() {
    this.logger.log('Starting game')

    this.update({ ...this, status: RoomStatus.INGAME })

    this.gameState = new Game(
      this,
      this.gameGateway,
      this.paddleRatio,
      this.gameDuration,
      this.ballSpeed
    )
    this.gameState.startGame()
  }
}
