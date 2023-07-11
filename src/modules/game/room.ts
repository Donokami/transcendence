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
  invited: User[];
  owner: User;
  isPrivate: boolean;
  status: RoomStatus;
  maxPlayers: number;
}

export class Room implements RoomObject {
  id = '';
  name = '';
  players = [];
  observers = [];
  invited = [];
  owner = null;
  isPrivate = false;
  status = RoomStatus.OPEN;
  maxPlayers = MAX_PLAYERS;

  private readonly logger = new Logger(Room.name);
  constructor({ name, owner, isPrivate }: RoomOpts) {
    if (!owner) {
      throw new Error('Room must have an owner');
    }

    this.id = randomUUID();

    this.logger.log(`Creating room ${this.id}`);

    this.name = name || `${owner.username}'s room`;

    this.isPrivate = isPrivate || false;

    this.owner = owner;

    this.players.push(owner);
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
      maxPlayers: this.maxPlayers,
    };
  }

  public join(user: User) {
    if (this.players.find((u) => u.id === user.id)) {
      throw new Error('User is already in the room');
    }

    if (this.isPrivate && !this.invited.find((u) => u.id === user.id)) {
      throw new Error('User is not invited');
    }

    if (this.players.length < MAX_PLAYERS && this.status === RoomStatus.OPEN) {
      this.players.push(user);

      if (this.players.length === MAX_PLAYERS) {
        this.status = RoomStatus.FULL;
      }
    } else {
      this.observers.push(user);
    }
  }

  public leave(user: User) {
    if (this.players.find((u) => u.id === user.id)) {
      this.players = this.players.filter((u) => u.id !== user.id);

      if (this.status === RoomStatus.FULL) {
        this.status = RoomStatus.OPEN;
      }
    } else {
      this.observers = this.observers.filter((u) => u !== user);
    }
  }

  public invite(user: User) {
    if (this.invited.find((u) => u.id === user.id)) {
      throw new Error('User is already invited');
    }

    this.invited.push(user);
  }

  public update(updatedRoom: RoomObject) {
    Object.keys(updatedRoom).forEach((key) => {
      if (updatedRoom[key] !== undefined) {
        this[key] = updatedRoom[key];
      }
    });
    return this.get();
  }

  public isFull() {
    return this.players.length === MAX_PLAYERS;
  }
}
