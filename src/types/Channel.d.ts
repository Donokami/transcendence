import type { User } from './User'

export interface Channel {
  // **************************** //
  // GENERAL CHANNEL INFORMATIONS //
  // **************************** //
  id: string
  name: string
  isDm: boolean

  // **************************** //
  // MEMBERS RELATED INFORMATIONS //
  // **************************** //

  receiver: User
  owner: User
  members: Array<User>
  bannedMembers: Array<User>

  // **************************** //
  // PRIVACY RELATED INFORMATIONS //
  // **************************** //
  passwordRequired: boolean
  password: string

  // ***************************** //
  // MESSAGES RELATED INFORMATIONS //
  // ***************************** //
  messages: Array<Message>
}
