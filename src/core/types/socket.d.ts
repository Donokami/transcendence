import type { IncomingMessage } from 'http';
import type { Socket } from 'socket.io';

interface UserIncomingMessage extends IncomingMessage {
  user: any; // todo: add user type
}

export interface UserSocket extends Socket {
  request: UserIncomingMessage;
}
