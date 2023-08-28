import { ApiProperty } from '@nestjs/swagger'

import {
  Column,
  Entity,
  JoinTable,
  OneToMany,
  ManyToMany,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm'

import { Channel } from '@/modules/chat/channels/entities/channel.entity'
import { type Message } from '@/modules/chat/channels/entities/message.entity'
import { Friendship } from '@/modules/social/entities/friendship.entity'
import { Exclude } from 'class-transformer'

export enum UserStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  INGAME = 'ingame'
}

@Entity()
export class User {
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
  @Exclude({ toPlainOnly: true })
  password: string

  @Column({ nullable: true })
  @ApiProperty()
  profilePicture: string

  @Column({ nullable: true, select: false })
  @Exclude({ toPlainOnly: true })
  twoFactorSecret: string

  @Column({ default: false })
  isTwoFactorEnabled: boolean

  @Column({ default: 'offline' })
  @ApiProperty()
  status: string

  nFriends: number
  blockedUsers: User[]

  @OneToMany(() => Friendship, (friendship) => friendship.sender)
  sentRequests: Friendship[]

  @OneToMany(() => Friendship, (friendship) => friendship.receiver)
  receivedRequests: Friendship[]

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

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
