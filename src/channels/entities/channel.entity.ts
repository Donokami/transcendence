import {
  AfterInsert,
  AfterRemove,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToMany,
} from 'typeorm';

import { User } from '../../users/user.entity';
import { Message } from './message.entity';

@Entity()
export class Channel {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  ownerId: string;

  @OneToMany(() => User, (user: User) => user.channel)
  members: Array<User>;

  @ManyToMany(() => User, (user: User) => user.bannedChannels)
  bannedMembers: Array<User>;

  @OneToMany(() => Message, (message: Message) => message.channel)
  messages: Array<Message>;

  @AfterInsert()
  logInsert() {
    console.log(`Channel with id ${this.id} inserted`);
  }

  @AfterRemove()
  logRemove() {
    console.log(`Channel with id ${this.id} removed`);
  }
}
