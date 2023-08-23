import { User } from './user'

export interface Match {
  id: string
  playerA: User
  playerB: User
  scoreA: number
  scoreB: number
  playedAt: number
}
