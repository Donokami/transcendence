import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
} from 'typeorm';

import { User } from '../../users/user.entity';

@Entity('friend')
export class Friend {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.friends)
  @JoinTable()
  userA: User;

  @ManyToOne(() => User, (user) => user.friends)
  @JoinTable()
  userB: User;
}
