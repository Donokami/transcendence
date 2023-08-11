import {
  AfterInsert,
  AfterRemove,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToMany,
  OneToOne,
  ManyToOne
} from 'typeorm'

import { User } from '@/modules/users/user.entity'

import { Message } from './message.entity'
import { Logger } from '@nestjs/common'
import { MutedUser } from './muted-user.entity'

// ****** //
// LOGGER //
// ****** //

const logger = new Logger('channel')

@Entity()
export class Channel {
  // ************* //
  // ENTITY FIELDS //
  // ************* //

  // **************************** //
  // GENERAL CHANNEL INFORMATIONS //
  // **************************** //

  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ nullable: true })
  name: string

  @Column({ default: true })
  isDm: boolean

  // **************************** //
  // MEMBERS RELATED INFORMATIONS //
  // **************************** //

  @ManyToOne(() => User)
  owner: User

  @ManyToMany(() => User, (user: User) => user.channels)
  members: Array<User>

  @ManyToMany(() => User, (user: User) => user.administratedChannels)
  admins: User[]

  @ManyToMany(() => User, (user: User) => user.bannedChannels)
  bannedMembers: User[]

  @OneToMany(() => MutedUser, (mutedUser: MutedUser) => mutedUser.channel)
  mutedMembers: MutedUser[]

  // **************************** //
  // PRIVACY RELATED INFORMATIONS //
  // **************************** //

  @Column({ default: false })
  isPrivate: boolean

  @Column({ nullable: true, select: false })
  password: string

  // ***************************** //
  // MESSAGES RELATED INFORMATIONS //
  // ***************************** //

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

  addMuteMember(user: User, muteEndDate: Date) {
    if (!this.mutedMembers) this.mutedMembers = []

    const mutedMember = new MutedUser()

    mutedMember.channel = this
    mutedMember.user = user
    mutedMember.muteEndDate = muteEndDate

    this.mutedMembers.push(mutedMember)
    //todo: save if not done automatically
  }

  removeMuteMember(user: User) {
    if (!this.mutedMembers) return
    this.mutedMembers = this.mutedMembers.filter((mute) => mute.user !== user)
    //todo: save if not done automatically
  }

  isAdmin(user: User) {
    return this.admins.find((admin) => user.id === admin.id)
  }
}
