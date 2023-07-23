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

  @ManyToMany(() => User, (user: User) => user.bannedChannels)
  bannedMembers: User[]

  // **************************** //
  // PRIVACY RELATED INFORMATIONS //
  // **************************** //

  @Column({ default: false })
  passwordRequired: boolean

  @Column({ nullable: true })
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
}
