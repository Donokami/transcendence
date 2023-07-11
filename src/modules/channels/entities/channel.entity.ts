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

@Entity()
export class Channel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @OneToOne(() => User)
  ownerId: string;

  @OneToMany(() => User, (user: User) => user.channel)
  members: User[];

  @ManyToMany(() => User, (user: User) => user.bannedChannels)
  bannedMembers: User[];

  @OneToMany(() => Message, (message: Message) => message.channel)
  messages: Message[];

  @AfterInsert()
  logInsert() {
    console.log(`Channel with id ${this.id} inserted`);
  }

  @AfterRemove()
  logRemove() {
    console.log(`Channel with id ${this.id} removed`);
  }
}
