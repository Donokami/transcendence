// game.gateway.ts
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  namespace: '/game',
  transport: ['websocket', 'polling'],
})
export class GameGateway {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    client.emit('connection', 'Successfully connected to game server');
  }

  handleDisconnection(client: Socket) {
    client.emit('disconnection', 'Successfully disconnected from game server');
  }

  @SubscribeMessage('move')
  handleMove(
    @MessageBody() move: string,
    @ConnectedSocket() client: Socket,
  ): void {
    this.server.emit('move', client.id, move);
  }
}
