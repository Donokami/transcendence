import type { User } from './user'

export interface Message {
  id: number
  text: string
  sender: User
  receiver: User
}
