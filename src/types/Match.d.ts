import { User } from './user'

export interface Match {
  id: string
  players: User[]
  scoreA: number
  scoreB: number
  playedAt: number
}
