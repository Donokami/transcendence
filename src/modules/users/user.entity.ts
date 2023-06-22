import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  Column,
  Entity,
  JoinTable,
  OneToMany,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Channel } from '@/modules/channels/entities/channel.entity';
import { Message } from '@/modules/channels/entities/message.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  username: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  profile_picture: string;

  @Column({ default: false })
  is_admin: boolean;

  @JoinTable()
  @ManyToOne(() => Channel, (channel: Channel) => channel.members)
  channel: Channel;

  @JoinTable()
  @ManyToMany(() => Channel, (channel: Channel) => channel.bannedMembers, {
    eager: true,
  })
  bannedChannels: Array<Channel>;

  @OneToMany(() => Channel, (channel: Channel) => channel.messages)
  messages: Array<Message>;

  @AfterInsert()
  logInsert() {
    console.log(`User with id ${this.id} inserted`);
  }

  @AfterRemove()
  logRemove() {
    console.log(`User with id ${this.id} removed`, this.id);
  }

  @AfterUpdate()
  logUpdate() {
    console.log(`User with id ${this.id} updated`, this.id);
  }
}
