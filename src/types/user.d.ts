export interface User {
  // USER ID INFORMATIONS
  id: number
  username: string
  email: string
  password: string
  profile_picture: string
  status: string
  isTwoFactorEnabled: boolean
  // USER STATS INFORMATIONS
  rank: number
  games_played: number
  win: number
  loss: number
  win_rate: number
  points_scored: number
  points_conceded: number
  points_difference: number
  // USER FRIENDS INFORMATIONS
  friends: string[]
  n_friends: number
}
