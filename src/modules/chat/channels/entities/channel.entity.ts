import { Logger } from '@nestjs/common'

import {
  AfterInsert,
  AfterRemove,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToMany,
  ManyToOne,
  Index
} from 'typeorm'

import { Message } from '@/modules/chat/channels/entities/message.entity'
import { MutedUser } from '@/modules/chat/channels/entities/muted-user.entity'
import { User } from '@/modules/users/user.entity'
import { Exclude } from 'class-transformer'

export enum ChannelTypes {
  PUBLIC = 'public',
  PRIVATE = 'private',
  PROTECTED = 'protected',
  DM = 'dm'
}

const logger = new Logger('channel')

@Entity()
export class Channel {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ nullable: true })
  @Index({ unique: true, where: 'name IS NOT NULL' })
  name: string

  @ManyToOne(() => User)
  owner: User

  @ManyToMany(() => User, (user: User) => user.channels)
  members: Array<User>

  @ManyToMany(() => User, (user: User) => user.administratedChannels)
  admins: User[]

  @ManyToMany(() => User, (user: User) => user.bannedChannels)
  bannedMembers: User[]

  @OneToMany(() => MutedUser, (mutedUser: MutedUser) => mutedUser.channel, {
    cascade: ['insert', 'update', 'remove']
  })
  mutedMembers: MutedUser[]

  @Column({
    type: process.env.NODE_ENV === 'production' ? 'enum' : 'text',
    enum: ChannelTypes,
    default: ChannelTypes.PUBLIC
  })
  type: ChannelTypes

  @Column({ nullable: true, select: false })
  @Exclude({ toPlainOnly: true })
  password: string

  @OneToMany(() => Message, (message: Message) => message.channel)
  messages: Message[]

  @AfterInsert()
  logInsert() {
    logger.verbose(`Channel with id ${this.id} inserted`)
  }

  @AfterRemove()
  logRemove() {
    logger.verbose(`Channel with id ${this.id} removed`)
  }

  addMutedMember(user: User, muteEndDate: Date) {
    if (!this.mutedMembers) this.mutedMembers = []

    const mutedMember = new MutedUser()

    mutedMember.channel = this
    mutedMember.user = user
    mutedMember.muteEndDate = muteEndDate

    this.mutedMembers.push(mutedMember)
  }

  removeMuteMember(user: User) {
    if (!this.mutedMembers) return
    this.mutedMembers = this.mutedMembers.filter(
      (mute) => mute.user.id !== user.id
    )
  }

  isAdmin(user: User) {
    return this.admins.find((admin) => user.id === admin.id)
  }

  isMuted(user: User) {
    return this.mutedMembers.find(
      (mutedMember) => mutedMember.user.id === user.id
    )
  }

  isDm() {
    return this.type === ChannelTypes.DM
  }

  isPublic() {
    return this.type === ChannelTypes.PUBLIC
  }

  isPrivate() {
    return this.type === ChannelTypes.PRIVATE
  }

  isProtected() {
    return this.type === ChannelTypes.PROTECTED
  }
}
