import { MAX_PLAYERS } from '@/core/constants';
import { Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { User } from '../users/user.entity';
import { GameGateway } from './game.gateway';

export enum RoomStatus {
  OPEN = 'open',
  FULL = 'full',
  INGAME = 'ingame',
}

interface RoomOpts {
  name: string;
  owner: User;
  isPrivate: boolean;
}

export interface RoomObject {
  id: string;
  name: string;
  players: User[];
  observers: User[];
  owner: User;
  isPrivate: boolean;
  status: RoomStatus;
  maxPlayers: number;
}

export class Room {
  private room: RoomObject = {
    id: '',
    name: '',
    players: [],
    observers: [],
    owner: null,
    isPrivate: false,
    status: RoomStatus.OPEN,
    maxPlayers: MAX_PLAYERS,
  };
  private logger = new Logger(Room.name);
  constructor(opts: RoomOpts, private gameGateway: GameGateway) {
    if (!opts || !opts.owner) {
      throw new Error('Room must have an owner');
    }

    this.room.id = randomUUID();

    this.logger.log(`Creating room ${this.room.id}`);

    this.room.name = opts.name || `${opts.owner.username}'s room`;

    this.room.isPrivate = opts.isPrivate || false;

    this.room.owner = opts.owner;

    this.room.players.push(opts.owner);
  }

  public getRoom() {
    return this.room;
  }

  public join(user: User) {
    if (this.room.players.find((u) => u.id === user.id)) {
      return;
    }

    if (this.room.players.length < MAX_PLAYERS) {
      this.room.players.push(user);

      if (this.room.players.length === MAX_PLAYERS) {
        this.room.status = RoomStatus.FULL;
      }
    } else {
      this.room.observers.push(user);
    }
  }

  public leave(user: User) {
    if (this.room.players.find((u) => u.id === user.id)) {
      this.room.players = this.room.players.filter((u) => u.id !== user.id);

      if (this.room.status === RoomStatus.FULL) {
        this.room.status = RoomStatus.OPEN;
      }
    } else {
      this.room.observers = this.room.observers.filter((u) => u !== user);
    }
  }

  public isFull() {
    return this.room.players.length >= MAX_PLAYERS;
  }

  public setOwner(user: User) {
    this.room.owner = user;
  }

  public setName(name: string) {
    this.room.name = name;
  }

  public setPrivate(isPrivate: boolean) {
    this.room.isPrivate = isPrivate;
  }
}
