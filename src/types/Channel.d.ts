import type { User } from './User'

export interface Channel {
  // **************************** //
  // GENERAL CHANNEL INFORMATIONS //
  // **************************** //
  id: string
  name: string
  isDm: boolean
  image: string

  // **************************** //
  // MEMBERS RELATED INFORMATIONS //
  // **************************** //

  owner: User
  members: User[]
  admins: User[]
  bannedMembers: User[]
  kickedMembers: User[]
  mutedMembers: User[]

  // **************************** //
  // PRIVACY RELATED INFORMATIONS //
  // **************************** //
  passwordRequired: boolean
  password: string

  // ***************************** //
  // MESSAGES RELATED INFORMATIONS //
  // ***************************** //
  messages: Message[]
}
