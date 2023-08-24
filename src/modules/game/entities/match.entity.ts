import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm'

import { User } from '@/modules/users/user.entity'

@Entity()
export class Match {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => User)
  @JoinColumn()
  playerA: User

  @ManyToOne(() => User)
  @JoinColumn()
  playerB: User

  @Column({ default: 0 })
  scoreA: number

  @Column({ default: 0 })
  scoreB: number

  @CreateDateColumn()
  playedAt: Date
}
