import { User } from '@/types'

export interface Room {
  id: string
  name: string
  players: User[]
  owner: User | null
  isPrivate: boolean
  paddleRatio: number
  gameDuration: number
  ballSpeed: number
  status: string
}
