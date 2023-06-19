import type { Channel } from './Channel'

export interface User {
  // USER IDENTIFIERS
  id: number
  username: string
  email: string
  password: string
  profile_picture: string
  
  // OTHER INFORMATIONS
  status: string

  // FRIENDSHIP RELATED INFORMATIONS
  friends: string[]
  n_friends: number

  // CHAT RELATED INFORMATIONS
  channels: Array<Channel>
  bannedChannels: Array<Channel>
  is_admin: boolean
  messages: Array<Message>

  // STATS RELATED INFORMATIONS
  rank: number
  games_played: number
  win: number
  loss: number
  win_rate: number
  points_scored: number
  points_conceded: number
  points_difference: number
  
}
