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
  PrimaryGeneratedColumn
} from 'typeorm'

import { Logger } from '@nestjs/common'

import { Channel } from '@/modules/chat/channels/entities/channel.entity'
import { Friendship } from '@/modules/social/entities/friendship.entity'
import { type Message } from '@/modules/chat/channels/entities/message.entity'

// ****** //
// LOGGER //
// ****** //

const logger = new Logger('user')

@Entity()
export class User {
  // ************* //
  // ENTITY FIELDS //
  // ************* //

  // ******************* //
  // USER AUTHENTICATION //
  // ******************* //

  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ unique: true })
  username: string

  @Column({ select: false, unique: true })
  email: string

  @Column({ nullable: true, select: false })
  password: string

  @Column({ nullable: true })
  profilePicture: string

  @Column({ nullable: true, select: false })
  twoFactorSecret: string

  @Column({ default: false, select: false })
  isTwoFactorEnabled: boolean

  // ****************** //
  // OTHER INFORMATIONS //
  // ****************** //

  @Column({ default: 'offline' })
  status: string

  // ******************************* //
  // FRIENDSHIP RELATED INFORMATIONS //
  // ******************************* //

  nFriends: number

  @OneToMany(() => Friendship, (friendship) => friendship.sender)
  sentRequests: Friendship[]

  @OneToMany(() => Friendship, (friendship) => friendship.receiver)
  receivedRequests: Friendship[]

  // ************************* //
  // CHAT RELATED INFORMATIONS //
  // ************************* //

  @JoinTable()
  @ManyToMany(() => Channel, (channel: Channel) => channel.members)
  channels: Array<Channel>

  @JoinTable()
  @ManyToMany(() => Channel, (channel: Channel) => channel.bannedMembers)
  bannedChannels: Channel[]

  @OneToMany(() => Channel, (channel: Channel) => channel.messages)
  messages: Message[]

  // ************************** //
  // STATS RELATED INFORMATIONS //
  // ************************** //

  @Column({ nullable: true, select: false })
  rank: number

  @Column({ default: 0, select: false })
  gamesPlayed: number

  @Column({ default: 0, select: false })
  win: number

  @Column({ default: 0, select: false })
  loss: number

  @Column({ default: 0, select: false })
  winRate: number

  @Column({ default: 0, select: false })
  pointsScored: number

  @Column({ default: 0, select: false })
  pointsConceded: number

  @Column({ default: 0, select: false })
  pointsDifference: number

  // ***** //
  // UTILS //
  // ***** //

  @AfterInsert()
  logInsert() {
    logger.verbose(`User with id ${this.id} inserted`)
  }

  @AfterRemove()
  logRemove() {
    logger.verbose(`User with id ${this.id} removed`, this.id)
  }

  @AfterUpdate()
  logUpdate() {
    logger.verbose(`User with id ${this.id} updated`, this.id)
  }
}
