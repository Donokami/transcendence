import { User } from '@/types'

export interface Room {
  id: string
  name: string
  players: User[]
  owner: User
  isPrivate: boolean
  paddleRatio: number
  gameDuration: number
  ballSpeed: number
  status: string
}
