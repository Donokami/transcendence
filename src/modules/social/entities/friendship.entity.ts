import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { User } from '@/modules/users/user.entity';

export enum FriendshipStatus {
  ACCEPTED = 'accepted',
  BLOCKED = 'blocked',
  REJECTED = 'rejected',
  PENDING = 'pending',
}

@Entity()
export class Friendship {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  senderId: string;

  @Column()
  receiverId: string;

  @Column({
    type: process.env.NODE_ENV === 'production' ? 'enum' : 'text',
    enum: FriendshipStatus,
    default: FriendshipStatus.PENDING,
  })
  status: FriendshipStatus;

  @ManyToOne(() => User, (user) => user.sentRequests)
  userA: User;

  @ManyToOne(() => User, (user) => user.receivedRequests)
  userB: User;
}
