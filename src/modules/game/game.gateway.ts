// game.gateway.ts
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';
import { Inject, Logger, forwardRef } from '@nestjs/common';
import { UserSocket } from '@/core/types/socket';

@WebSocketGateway({
  namespace: '/game',
  transport: ['websocket', 'polling'],
})
export class GameGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    @Inject(forwardRef(() => GameService))
    private gameService: GameService,
  ) {}

  private readonly logger = new Logger(GameService.name);

  async handleConnection(client: Socket) {
    const gameId = client.handshake.query.gameId as string;
    client.emit('connection', 'Successfully connected to game server');
    const game = await this.gameService.findOne(gameId);

    if (!game) {
      client.emit('error', `Game ${gameId} not found`);
      return;
    }

    client.join(gameId);

    this.logger.verbose(`Client ${client.id} connected to game ${gameId}`);
  }

  handleDisconnect(client: UserSocket) {
    const gameId = client.handshake.query.gameId as string;
    this.gameService.leave(gameId, client.request.user.id).catch((err) => {});
    this.logger.verbose(`Client ${client.id} disconnected`);
    client.emit('disconnection', 'Successfully disconnected from game server');
  }

  @SubscribeMessage('join')
  async handleJoin(
    @MessageBody() room: string,
    @ConnectedSocket() client: UserSocket,
  ): Promise<void> {
    const game = await this.gameService.findOne(room);

    if (!game) {
      client.emit('error', `Game ${room} not found`);
      return;
    }

    this.gameService.join(room, client.request.user.id).catch((err) => {});

    client.join(room);

    this.server.to(room).emit('game:update', game.getRoom());
  }

  @SubscribeMessage('leave')
  async handleLeave(
    @MessageBody() room: string,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const game = await this.gameService.findOne(room);

    if (!game) {
      client.emit('error', `Game ${room} not found`);
      return;
    }

    client.leave(room);
  }

  @SubscribeMessage('move')
  async handleMove(
    @MessageBody('x') x: number,
    @MessageBody('room_id') room_id: string,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const room = await this.gameService.findOne(room_id);

    // game.updatePos(client.request.user.id, x);
    if (x < 0 || x > 1) {
      client.emit('error', 'Invalid move');
    }
  }
}
