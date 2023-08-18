import { Logger } from '@nestjs/common'

import {
  AfterInsert,
  AfterRemove,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne
} from 'typeorm'

import { Channel } from '@/modules/chat/channels/entities/channel.entity'
import { User } from '@/modules/users/user.entity'

const logger = new Logger('message')

@Entity()
export class Message {

  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  messageBody: string

  @ManyToOne(() => Channel, (channel: Channel) => channel.messages, {
    onDelete: 'CASCADE'
  })
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
