import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  Column,
  Entity,
  JoinTable,
  OneToMany,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Channel } from '@/modules/channels/entities/channel.entity';

import { Friend } from '@/modules/social/entities/friend.entity';
import { BlockedUser } from '@/modules/social/entities/blockedUser.entity';
import { PendingRequest } from '@/modules/social/entities/pendingRequest.entity';

import { Message } from '@/modules/channels/entities/message.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  username: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  profile_picture: string;

  @Column({ default: false })
  is_admin: boolean;

  @JoinTable()
  @ManyToOne(() => Channel, (channel: Channel) => channel.members)
  channel: Channel;

  @JoinTable()
  @ManyToMany(() => Channel, (channel: Channel) => channel.bannedMembers, {
    eager: true,
  })
  bannedChannels: Array<Channel>;

  @OneToMany(() => Channel, (channel: Channel) => channel.messages)
  messages: Array<Message>;

  @Column({ default: 'offline' })
  status: string;

  @Column({ nullable: true })
  rank: number;

  @Column({ default: 0 })
  games_played: number;

  @Column({ default: 0 })
  win: number;

  @Column({ default: 0 })
  loss: number;

  @Column({ default: 0 })
  win_rate: number;

  @Column({ default: 0 })
  points_scored: number;

  @Column({ default: 0 })
  points_conceded: number;

  @Column({ default: 0 })
  points_difference: number;

  @OneToMany(() => Friend, (friend) => friend.userA)
  @JoinTable()
  friends: Array<Friend>;

  @OneToMany(() => PendingRequest, (pendingRequest) => pendingRequest.user)
  @JoinTable()
  pendingRequests: Array<PendingRequest>;

  @OneToMany(() => BlockedUser, (friend) => friend.currentUser)
  @JoinTable()
  blockedUsers: BlockedUser[];

  @Column({ default: 0 })
  n_friends: number;

  @AfterInsert()
  logInsert() {
    console.log(`User with id ${this.id} inserted`);
  }

  @AfterRemove()
  logRemove() {
    console.log(`User with id ${this.id} removed`, this.id);
  }

  @AfterUpdate()
  logUpdate() {
    console.log(`User with id ${this.id} updated`, this.id);
  }
}
