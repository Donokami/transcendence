import { MAX_PLAYERS } from '@/core/constants';
import { Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { type User } from '../users/user.entity';

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

  private readonly logger = new Logger(Room.name);
  constructor({ name, owner, isPrivate }: RoomOpts) {
    if (!owner) {
      throw new Error('Room must have an owner');
    }

    this.room.id = randomUUID();

    this.logger.log(`Creating room ${this.room.id}`);

    this.room.name = name || `${owner.username}'s room`;

    this.room.isPrivate = isPrivate || false;

    this.room.owner = owner;

    this.room.players.push(owner);
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

  public update(updatedRoom: RoomObject) {
    this.room = updatedRoom;
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
