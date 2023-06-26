import type { Channel } from './Channel'

export interface User {
  // USER IDENTIFIERS
  id: string;
  username: string
  email: string
  password: string
  profilePicture: string
  
  // OTHER INFORMATIONS
  status: string

  // FRIENDSHIP RELATED INFORMATIONS
  friends: string[]
  nFriends: number

  // CHAT RELATED INFORMATIONS
  channels: Array<Channel>
  bannedChannels: Array<Channel>
  isAdmin: boolean
  messages: Array<Message>

  // STATS RELATED INFORMATIONS
  rank: number
  gamesPlayed: number
  win: number
  loss: number
  winRate: number
  pointsScored: number
  pointsConceded: number
  pointsDifference: number
  
}
