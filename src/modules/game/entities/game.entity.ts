import {
  AfterInsert,
  AfterRemove,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';

import { User } from '@/modules/users/user.entity';
import { Logger } from '@nestjs/common';
import { MAX_PLAYERS } from '@/core/constants';

const logger = new Logger('GameEntity');

export enum RoomStatus {
  OPEN = 'open',
  FULL = 'full',
  INGAME = 'ingame',
}

@Entity()
export class Game {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @OneToOne(() => User)
  @JoinColumn()
  owner: User;

  @Column({
    default: false,
  })
  isPrivate: boolean;

  @ManyToMany(() => User)
  @JoinTable()
  players: User[];

  @ManyToMany(() => User)
  @JoinTable()
  observers: User[];

  @Column({
    default: MAX_PLAYERS,
  })
  maxPlayers: number;

  @Column({
    // type: 'enum',
    enum: RoomStatus,
    default: RoomStatus.OPEN,
  })
  status: RoomStatus; // todo: sqlite doesn't support enum

  @AfterInsert()
  logInsert() {
    logger.verbose(`Game with id ${this.id} inserted`);
  }

  @AfterRemove()
  logRemove() {
    logger.verbose(`An game has been removed`);
  }
}
