import type { Message, User } from '@/types'

export enum ChannelTypes {
  PUBLIC = 'public',
  PRIVATE = 'private',
  PROTECTED = 'protected',
  DM = 'dm'
}

export interface Channel {
  // **************************** //
  // GENERAL CHANNEL INFORMATIONS //
  // **************************** //
  id: string
  name: string
  dmUser?: User
  image: string
  unreadMessages: number
  isDm: boolean
  isMuted: boolean

  // **************************** //
  // MEMBERS RELATED INFORMATIONS //
  // **************************** //

  owner: User
  members: User[]
  admins: User[]
  bannedMembers: User[]
  mutedMembers: User[]

  // **************************** //
  // PRIVACY RELATED INFORMATIONS //
  // **************************** //
  type: ChannelTypes
  password: string

  // ***************************** //
  // MESSAGES RELATED INFORMATIONS //
  // ***************************** //
  messages: Message[]
}
