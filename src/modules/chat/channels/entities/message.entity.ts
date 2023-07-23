import {
  AfterInsert,
  AfterRemove,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn
} from 'typeorm'

import { Logger } from '@nestjs/common'

import { User } from '@/modules/users/user.entity'

import { Channel } from './channel.entity'

const logger = new Logger('message')

@Entity()
export class Message {
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

  @Column()
  createdAt: Date

  @AfterInsert()
  logInsert() {
    logger.verbose(`Message with id ${this.id} inserted`)
  }

  @AfterRemove()
  logRemove() {
    logger.verbose(`Message with id ${this.id} removed`)
  }
}
