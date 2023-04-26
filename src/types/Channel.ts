import type { User } from './User.js'

export interface Channel {
  name: string
  members: User[]
  passwordRequired: boolean
  password: string
}
