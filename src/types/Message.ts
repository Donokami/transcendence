import type { User } from './User.js'

export interface Message {
  id: number
  text: string
  sender: User
  receiver: User
}
