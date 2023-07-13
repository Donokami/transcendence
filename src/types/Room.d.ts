import { User } from './User'

export interface Room {
  id: string
  name: string
  players: User[]
  observers: User[]
  invited: User[]
  owner: User
  isPrivate: boolean
  status: RoomStatus
  maxPlayers: number
}
