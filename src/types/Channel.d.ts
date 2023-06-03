import type { User } from './user'

export interface Channel {
  name: string
  members: User[]
  passwordRequired: boolean
  password: string
}
