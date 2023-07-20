import {
  AfterInsert,
  AfterRemove,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne
} from 'typeorm'

import { Logger } from '@nestjs/common'

import { User } from '@/modules/users/user.entity'

import { Channel } from './channel.entity'

@Entity()
export class Message {
  // ****** //
  // LOGGER //
  // ****** //

  private logger = new Logger(Message.name)

  // ************* //
  // ENTITY FIELDS //
  // ************* //

  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  messageBody: string

  @ManyToOne(() => Channel, (channel: Channel) => channel.messages)
  channel: Channel

  @ManyToOne(() => User, (user: User) => user.messages)
  user: User

  @AfterInsert()
  logInsert() {
    this.logger.verbose(`Message with id ${this.id} inserted`)
  }

  @AfterRemove()
  logRemove() {
    this.logger.verbose(`Message with id ${this.id} removed`)
  }
}
