import type { Channel } from './Channel'

export interface User {
  // USER INFORMATIONS INSPIRED BY BACKEND USER ENTITY
  id: number
  username: string
  email: string
  password: string
  profile_picture: string
  is_admin: boolean
  channels: Array<Channel>
  bannedChannels: Array<Channel>
  messages: Array<Message>

  
  // OTHER USER INFORMATIONS
  status: string
  rank: number
  games_played: number
  win: number
  loss: number
  win_rate: number
  points_scored: number
  points_conceded: number
  points_difference: number
  friends: string[]
  n_friends: number
}
