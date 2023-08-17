import type { Channel } from './Channel'
import type { Friendship } from './Friendship'

export interface User {
  // ******************* //
  // USER AUTHENTICATION //
  // ******************* //

  id: string
  username: string
  password: string
  profilePicture: string
  isTwoFactorEnabled: boolean

  // ****************** //
  // OTHER INFORMATIONS //
  // ****************** //

  status: string

  // ******************************* //
  // FRIENDSHIP RELATED INFORMATIONS //
  // ******************************* //

  friends: User[]
  nFriends: number
  sentRequest: Friendship[]
  receivedRequest: Friendship[]
  isBlockedBy: boolean
  blockedUsers: User[]

  // ************************* //
  // CHAT RELATED INFORMATIONS //
  // ************************* //

  channels: Channel[]
  bannedChannels: Channel[]
  messages: Message[]

  // ************************** //
  // STATS RELATED INFORMATIONS //
  // ************************** //

  rank: number
  gamesPlayed: number
  win: number
  loss: number
  winRate: number
  pointsScored: number
  pointsConceded: number
  pointsDifference: number
}
