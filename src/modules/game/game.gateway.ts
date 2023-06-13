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
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET,POST,DELETE'],
    credentials: true,
  },
  transport: ['websocket', 'polling'],
})
export class GameGateway {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(
      `[DEBUG] - BACK - handleConnection called in game.gateway.ts (client id = : ${client.id})`,
    );
    // client.emit('connection', 'Successfully connected to game server');
  }

  handleDisconnection(client: Socket) {
    console.log(`Client disconnected : ${client.id}`);
    // client.emit('disconnection', 'Successfully disconnected from game server');
  }

  @SubscribeMessage('move')
  handleMove(
    @MessageBody() move: string,
    @ConnectedSocket() client: Socket,
  ): void {
    this.server.emit('move', client.id, move);
  }
}
