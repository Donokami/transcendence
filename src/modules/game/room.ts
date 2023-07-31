import { MAX_PLAYERS } from '@/core/constants'
import { Logger } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { User } from '../users/user.entity'
import { GameGateway } from './game.gateway'
import { Game } from './game.engine'
import {
  RoomNeedsAnOwner,
  UserAlreadyInRoom,
  UserAlreadyInvited,
  UserNotInvited
} from '@/core/exceptions'

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
  observers: User[]
  invited: User[]
  owner: User
  isPrivate: boolean
  status: RoomStatus
  maxPlayers: number
  gameState?: Game
}

export class Room implements RoomObject {
  id = ''
  name = ''
  players = []
  observers = []
  invited = []
  owner = null
  isPrivate = false
  status = RoomStatus.OPEN
  maxPlayers = MAX_PLAYERS
  gameState = null

  private readonly logger = new Logger(Room.name)
  constructor(
    { name, owner, isPrivate }: RoomOpts,
    private readonly gameGateway: GameGateway
  ) {
    if (!owner) {
      throw new RoomNeedsAnOwner()
    }

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
      observers: this.observers,
      invited: this.invited,
      owner: this.owner,
      isPrivate: this.isPrivate,
      status: this.status,
      maxPlayers: this.maxPlayers
    }
  }

  public join(user: User) {
    if (this.players.find((u) => u.id === user.id)) {
      throw new UserNotInvited()
    }

    if (this.isPrivate && !this.invited.find((u) => u.id === user.id)) {
      throw new UserNotInvited()
    }

    if (this.players.length < MAX_PLAYERS && this.status === RoomStatus.OPEN) {
      this.players.push(user)

      if (this.players.length === MAX_PLAYERS) {
        this.status = RoomStatus.FULL
      }
    } else {
      this.observers.push(user)
    }
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
    } else {
      this.observers = this.observers.filter((u) => u !== user)
    }
  }

  public invite(user: User) {
    if (this.invited.find((u) => u.id === user.id)) {
      throw new UserAlreadyInvited()
    }

    if (this.players.find((u) => u.id === user.id)) {
      // todo: to test
      throw new UserAlreadyInRoom()
    }

    this.invited.push(user)
  }

  public update(updatedRoom: RoomObject) {
    Object.assign(this, updatedRoom)

    this.gameGateway.server.to(this.id).emit('room:update', this.get())
    return this.get()
  }

  public startGame() {
    console.log('Starting game')

    this.update({ ...this, status: RoomStatus.INGAME })

    this.gameState = new Game(this, this.gameGateway)
    this.gameState.startGame()
  }

  public isFull() {
    return this.players.length === MAX_PLAYERS
  }
}
