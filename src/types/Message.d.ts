import type { User } from './User'
import type { Channel } from './Channel'

export interface Message {
  // MESSAGE INFORMATIONS INSPIRED BY BACKEND MESSAGE ENTITY
  id: string
  messageBody: string
  channel: Channel
  user: User
}
