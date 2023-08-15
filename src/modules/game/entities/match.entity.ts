import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn
} from 'typeorm'

import { User } from '@/modules/users/user.entity'

@Entity()
export class Match {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToMany(() => User)
  @JoinTable()
  players: User[]

  @Column({ default: 0 })
  scoreA: number

  @Column({ default: 0 })
  scoreB: number

  @Column(
    process.env.NODE_ENV === 'production'
      ? { type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' }
      : { default: Date.now() }
  )
  playedAt: Date
}
