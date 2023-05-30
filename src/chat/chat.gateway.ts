import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway(3000, { namespace: 'chat' })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected : ${client.id}`);
    // client.emit('connection', 'Successfully connected to chat server');
  }

  handleDisconnection(client: Socket) {
    console.log(`Client disconnected : ${client.id}`);
    // client.emit('disconnection', 'Successfully disconnected from chat server');
  }

  @SubscribeMessage('message')
  handleMessage(
    @MessageBody() message: string,
    @ConnectedSocket() client: Socket,
  ): void {
    this.server.emit('message', client.id, message);
  }
}
