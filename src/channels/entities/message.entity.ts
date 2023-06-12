import {
  AfterInsert,
  AfterRemove,
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinTable,
} from 'typeorm';

import { User } from '../../users/user.entity';
import { Channel } from './channel.entity';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  messageBody: string;

  @CreateDateColumn()
  created_at: Date;

  @JoinTable()
  @ManyToOne(() => Channel, (channel: Channel) => channel.messages)
  channel: Channel;

  @JoinTable()
  @ManyToOne(() => User, (user: User) => user.messages)
  user: User;

  @AfterInsert()
  logInsert() {
    console.log(`Message with id ${this.id} inserted`);
  }

  @AfterRemove()
  logRemove() {
    console.log(`Message with id ${this.id} removed`);
  }
}
