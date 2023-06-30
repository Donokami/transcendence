import type { Channel } from './Channel'
import type { Friendship } from './Friendship';

export interface User {
  // **************** //
  // User Identifiers //
  // **************** //

  id: string;
  username: string
  email: string
  password: string
  profilePicture: string
  
  // ****************** //
  // Other Informations //
  // ****************** //

  status: string

  // ******************************* //
  // Friendship Related Informations //
  // ******************************* //

  friends: Array<User>
  nFriends: number
  sentRequest: Array<Friendship>
  receivedRequest: Array<Friendship>

  // ************************* //
  // Chat Related Informations //
  // ************************* //

  channels: Array<Channel>
  bannedChannels: Array<Channel>
  isAdmin: boolean
  messages: Array<Message>

  // ************************** //
  // Stats Related Informations //
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
