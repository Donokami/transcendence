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
  id: number;

  @ManyToOne(() => User, (user) => user.sentRequests)
  @JoinColumn({ name: 'user_one_id' })
  userA: User;

  @ManyToOne(() => User, (user) => user.receivedRequests)
  @JoinColumn({ name: 'user_two_id' })
  userB: User;

  @Column()
  inActionUserId: number;

  @Column({
    type: 'enum',
    enum: FriendshipStatus,
    default: FriendshipStatus.PENDING,
  })
  status: FriendshipStatus;
}
