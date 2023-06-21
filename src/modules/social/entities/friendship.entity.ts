import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from '@/modules/users/user.entity';

export enum FriendshipStatus {
  ACCEPTED = 'accepted',
  BLOCKED = 'blocked',
  DECLINED = 'declined',
  PENDING = 'pending',
}

@Entity()
export class Friendship {
  @PrimaryGeneratedColumn()
  id: string;

  @ManyToOne(() => User, (user) => user.sentRequests)
  userA: User;

  @ManyToOne(() => User, (user) => user.receivedRequests)
  userB: User;

  @Column()
  inActionUserId: string;

  @Column({
    type: process.env.NODE_ENV === 'production' ? 'enum' : 'text',
    enum: FriendshipStatus,
    default: FriendshipStatus.PENDING,
  })
  status: FriendshipStatus;
}
