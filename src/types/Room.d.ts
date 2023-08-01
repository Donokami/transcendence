import { User } from './User'

export interface Room {
  id: string
  name: string
  players: User[]
  owner: User
  isPrivate: boolean
  status: RoomStatus
}
