import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
} from 'typeorm';

import { User } from '../../users/user.entity';

@Entity('blockedUser')
export class BlockedUser {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.blockedUsers)
  @JoinTable()
  currentUser: User;

  @ManyToOne(() => User, (user) => user.blockedUsers)
  @JoinTable()
  otherUser: User;
}
