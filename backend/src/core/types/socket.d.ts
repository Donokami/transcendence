import { type User } from '@/modules/users/user.entity'
import type { IncomingMessage } from 'http'
import type { Socket } from 'socket.io'

interface IUserIncomingMessage extends IncomingMessage {
  user: User
}

export interface IUserSocket extends Socket {
  request: UserIncomingMessage
}
