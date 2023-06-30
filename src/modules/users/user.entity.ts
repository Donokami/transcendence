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
import { Friendship } from '@/modules/social/entities/friendship.entity';
import { Message } from '@/modules/channels/entities/message.entity';

@Entity()
export class User {
  // **************** //
  // User Identifiers //
  // **************** //

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  username: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  profilePicture: string;

  // ****************** //
  // Other Informations //
  // ****************** //

  @Column({ default: 'offline' })
  status: string;

  // ******************************* //
  // Friendship Related Informations //
  // ******************************* //

  @Column({ default: 0 })
  nFriends: number;

  @Column('simple-array', { nullable: true })
  friends: Array<User>;

  @OneToMany(() => Friendship, (friendship) => friendship.userA)
  sentRequests: Array<Friendship>;

  @OneToMany(() => Friendship, (friendship) => friendship.userB)
  receivedRequests: Array<Friendship>;

  // ************************* //
  // Chat Related Informations //
  // ************************* //

  @JoinTable()
  @ManyToOne(() => Channel, (channel: Channel) => channel.members)
  channel: Channel;

  @JoinTable()
  @ManyToMany(() => Channel, (channel: Channel) => channel.bannedMembers, {
    eager: true,
  })
  bannedChannels: Array<Channel>;

  @Column({ default: false })
  isAdmin: boolean;

  @OneToMany(() => Channel, (channel: Channel) => channel.messages)
  messages: Array<Message>;

  // ************************** //
  // Stats Related Informations //
  // ************************** //

  @Column({ nullable: true })
  rank: number;

  @Column({ default: 0 })
  gamesPlayed: number;

  @Column({ default: 0 })
  win: number;

  @Column({ default: 0 })
  loss: number;

  @Column({ default: 0 })
  winRate: number;

  @Column({ default: 0 })
  pointsScored: number;

  @Column({ default: 0 })
  pointsConceded: number;

  @Column({ default: 0 })
  pointsDifference: number;

  // ***** //
  // Utils //
  // ***** //

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
