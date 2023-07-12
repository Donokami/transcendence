// game.gateway.ts
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { GameService } from './game.service'
import { Inject, Logger, forwardRef } from '@nestjs/common'
import { UserSocket } from '@/core/types/socket'

@WebSocketGateway({
  namespace: '/game',
  transport: ['websocket', 'polling']
})
export class GameGateway {
  @WebSocketServer()
  server: Server

  constructor(
    @Inject(forwardRef(() => GameService))
    private gameService: GameService
  ) {}

  private readonly logger = new Logger(GameService.name)

  async handleConnection(client: Socket) {
    const roomId = client.handshake.query.roomId as string
    client.emit('connection', 'Successfully connected to game server')
    const room = await this.gameService.findOne(roomId)

    if (!room) {
      client.emit('error', `Room ${roomId} not found`)
      return
    }

    client.join(roomId)

    this.logger.verbose(`Client ${client.id} connected to room ${roomId}`)
  }

  handleDisconnect(client: UserSocket) {
    const roomId = client.handshake.query.roomId as string
    this.gameService.leave(roomId, client.request.user.id).catch((err) => {})
    this.logger.verbose(`Client ${client.id} disconnected`)
    client.emit('disconnection', 'Successfully disconnected from game server')
  }

  @SubscribeMessage('join')
  async handleJoin(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: UserSocket
  ): Promise<void> {
    const room = await this.gameService.findOne(roomId)

    if (!room) {
      client.emit('error', `Game ${roomId} not found`)
      return
    }

    this.gameService.join(roomId, client.request.user.id).catch((err) => {})

    client.join(roomId)

    this.server.to(roomId).emit('game:update', room.get())
  }

  @SubscribeMessage('leave')
  async handleLeave(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: Socket
  ): Promise<void> {
    const room = await this.gameService.findOne(roomId)

    if (!room) {
      client.emit('error', `Room ${roomId} not found`)
      return
    }

    client.leave(roomId)
  }

  @SubscribeMessage('start')
  async handleStart(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: UserSocket
  ): Promise<void> {
    const room = await this.gameService.findOne(roomId)

    // todo: check if the room is full and not started

    if (!room) {
      client.emit('error', `Room ${roomId} not found`)
      return
    }

    if (room.get().owner.id !== client.request.user.id) {
      client.emit('error', 'You are not the owner of this room')
      return
    }

    room.start()
  }

  // @SubscribeMessage('move')
  // async handleMove(
  //   @MessageBody('x') x: number,
  //   @MessageBody('room_id') room_id: string,
  //   @ConnectedSocket() client: Socket,
  // ): Promise<void> {
  //   const room = await this.gameService.findOne(room_id);

  //   // game.updatePos(client.request.user.id, x);
  //   if (x < 0 || x > 1) {
  //     client.emit('error', 'Invalid move');
  //   }
  // }
}
