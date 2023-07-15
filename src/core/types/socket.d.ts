import { type User } from '@/modules/users/user.entity';
import type { IncomingMessage } from 'http';
import type { Socket } from 'socket.io';

interface UserIncomingMessage extends IncomingMessage {
  user: User;
}

export interface UserSocket extends Socket {
  request: UserIncomingMessage;
}
