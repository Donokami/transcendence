import type { User } from './user'

export interface Channel {
  // CHANNEL INFORMATIONS INSPIRED BY BACKEND CHANNEL ENTITY
  id: string
  name: string
  ownerId: string
  members: Array<User>
  bannedMembers: Array<User>
  messages: Array<Message>

  // OTHER CHANNEL INFORMATIONS
  type: string
  passwordRequired: boolean
  password: string
}
