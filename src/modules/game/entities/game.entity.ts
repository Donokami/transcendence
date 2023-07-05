import {
  AfterInsert,
  AfterRemove,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';

import { User } from '@/modules/users/user.entity';

export enum RoomStatus {
  OPEN = 'open',
  CLOSED = 'closed',
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
  ownerId: string;

  @Column({
    default: false,
  })
  isPrivate: boolean;

  @Column({
    default: 1,
  })
  members: number;

  @Column({
    default: 2,
  })
  maxMembers: number;

  @Column({
    // type: 'enum',
    enum: RoomStatus,
    default: RoomStatus.OPEN,
  })
  status: RoomStatus; // todo: sqlite doesn't support enum

  @AfterInsert()
  logInsert() {
    console.log(`Room with id ${this.id} inserted`);
  }

  @AfterRemove()
  logRemove() {
    console.log(`Room with id ${this.id} removed`);
  }
}
