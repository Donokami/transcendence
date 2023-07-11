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
import { type Message } from '@/modules/channels/entities/message.entity';

@Entity()
export class User {
  // ******************* //
  // USER AUTHENTICATION //
  // ******************* //

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

  @Column({ nullable: true })
  twoFactorSecret: string;

  @Column({ default: false })
  isTwoFactorEnabled: boolean;

  // ****************** //
  // OTHER INFORMATIONS //
  // ****************** //

  @Column({ default: 'offline' })
  status: string;

  // ******************************* //
  // FRIENDSHIP RELATED INFORMATIONS //
  // ******************************* //

  nFriends: number;

  @OneToMany(() => Friendship, (friendship) => friendship.sender)
  sentRequests: Friendship[];

  @OneToMany(() => Friendship, (friendship) => friendship.receiver)
  receivedRequests: Friendship[];

  // ************************* //
  // CHAT RELATED INFORMATIONS //
  // ************************* //

  @JoinTable()
  @ManyToOne(() => Channel, (channel: Channel) => channel.members)
  channel: Channel;

  @JoinTable()
  @ManyToMany(() => Channel, (channel: Channel) => channel.bannedMembers, {
    eager: true,
  })
  bannedChannels: Channel[];

  // @Column({ default: false })
  // isAdmin: boolean;

  @OneToMany(() => Channel, (channel: Channel) => channel.messages)
  messages: Message[];

  // ************************** //
  // STATS RELATED INFORMATIONS //
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
  // UTILS //
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
