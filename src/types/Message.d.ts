import type { User } from './User'
import type { Channel } from './Channel'

export interface Message {
  // MESSAGE INFORMATIONS INSPIRED BY BACKEND MESSAGE ENTITY
  id: number
  messageBody: string
  created_at: Date
  channel: Channel
  user: User

  // OTHER MESSAGE INFORMATIONS
  sender: User
  receiver: User
}
