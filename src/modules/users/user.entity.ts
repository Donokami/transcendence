import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  Column,
  Entity,
  JoinTable,
  OneToMany,
  ManyToMany,
  PrimaryGeneratedColumn
} from 'typeorm'

import { Logger } from '@nestjs/common'

import { Channel } from '@/modules/chat/channels/entities/channel.entity'
import { Friendship } from '@/modules/social/entities/friendship.entity'
import { type Message } from '@/modules/chat/channels/entities/message.entity'
import { ApiProperty } from '@nestjs/swagger'

export enum UserStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  AWAY = 'away',
  INGAME = 'ingame'
}

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
  @ApiProperty()
  id: string

  @Column({ nullable: true, unique: true })
  @ApiProperty()
  fortyTwoId: string

  @Column({ nullable: true, unique: true })
  @ApiProperty()
  username: string

  @Column({ nullable: true, select: false })
  password: string

  @Column({ nullable: true })
  @ApiProperty()
  profilePicture: string

  @Column({ nullable: true, select: false })
  twoFactorSecret: string

  @Column({ default: false })
  isTwoFactorEnabled: boolean

  // ****************** //
  // OTHER INFORMATIONS //
  // ****************** //

  @Column({ default: 'offline' })
  @ApiProperty()
  status: string

  // ******************************* //
  // FRIENDSHIP RELATED INFORMATIONS //
  // ******************************* //

  nFriends: number
  blockedUsers: User[]

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
  @ManyToMany(() => Channel, (channel: Channel) => channel.admins)
  administratedChannels: Channel[]

  @JoinTable()
  @ManyToMany(() => Channel, (channel: Channel) => channel.bannedMembers)
  bannedChannels: Channel[]

  @JoinTable()
  @ManyToMany(() => Channel, (channel: Channel) => channel.mutedMembers)
  mutedChannels: Channel[]

  @OneToMany(() => Channel, (channel: Channel) => channel.messages)
  messages: Message[]

  // ************************** //
  // STATS RELATED INFORMATIONS //
  // ************************** //

  @Column({ default: 0, select: false })
  gamesPlayed: number

  @Column({ default: 0, select: false })
  win: number

  @Column({ default: 0, select: false })
  loss: number

  @Column({ type: 'float', default: 0, select: false })
  winRate: number

  @Column({ default: 0, select: false })
  pointsScored: number

  @Column({ default: 0, select: false })
  pointsConceded: number

  @Column({ default: 0, select: false })
  pointsDifference: number

  @Column({ default: Date.now() })
  @ApiProperty()
  createdAt: Date

  @Column({ default: Date.now(), select: false })
  updatedAt: Date

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

  @AfterUpdate()
  updateDate() {
    this.updatedAt = new Date()
  }
}
