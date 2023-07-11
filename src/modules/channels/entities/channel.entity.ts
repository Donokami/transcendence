import {
  AfterInsert,
  AfterRemove,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToMany,
  OneToOne,
} from 'typeorm';

import { User } from '@/modules/users/user.entity';

import { Message } from './message.entity';
import { Logger } from '@nestjs/common';

@Entity()
export class Channel {
  // ****** //
  // LOGGER //
  // ****** //

  private logger = new Logger(Channel.name);

  // ************* //
  // ENTITY FIELDS //
  // ************* //

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: true })
  isDm: boolean;

  @Column({ default: '' })
  name: string;

  @OneToOne(() => User)
  owner: User;

  @ManyToMany(() => User, (user: User) => user.channels)
  members: Array<User>;

  @ManyToMany(() => User, (user: User) => user.bannedChannels)
  bannedMembers: Array<User>;

  @OneToMany(() => Message, (message: Message) => message.channel)
  messages: Array<Message>;

  @AfterInsert()
  logInsert() {
    this.logger.verbose(`Channel with id ${this.id} inserted`);
  }

  @AfterRemove()
  logRemove() {
    this.logger.verbose(`Channel with id ${this.id} removed`);
  }
}
