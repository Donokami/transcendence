import { Inject, Logger, UseFilters, forwardRef } from '@nestjs/common'

import { Server, Socket } from 'socket.io'

import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets'

import { IUserSocket } from '@/core/types/socket'

import { GameService } from './game.service'
import { GlobalExceptionFilter } from '@/core/filters/global-exception.filters'
import { RoomNotFound } from '@/core/exceptions/game'

@WebSocketGateway({
  namespace: '/game',
  transport: ['websocket', 'polling']
})
@UseFilters(new GlobalExceptionFilter())
export class GameGateway {
  @WebSocketServer()
  server: Server

  constructor(
    @Inject(forwardRef(() => GameService))
    private gameService: GameService
  ) {}

  private readonly logger = new Logger(GameService.name)

  async handleConnection(client: Socket) {
    this.logger.verbose(`Client ${client.id} connected to /game socket`)
  }

  handleDisconnect(client: IUserSocket) {
    // const roomId = client.handshake.query.roomId as string
    // this.gameService.leave(roomId, client.request.user.id).catch((err) => {})
    this.gameService.leaveAll(client.request.user.id)
    this.logger.verbose(`Client ${client.id} disconnected`)
    client.emit('disconnection', 'Successfully disconnected from game server')
  }

  @SubscribeMessage('room:join')
  async handleJoin(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: IUserSocket
  ) {
    const room = this.gameService.findOne(roomId)

    if (!room) {
      throw new RoomNotFound()
    }

    await this.gameService.join(roomId, client.request.user.id)

    client.join(roomId)

    this.server.to(roomId).emit('room:update', room.get())
  }

  @SubscribeMessage('room:leave')
  async handleLeave(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: Socket
  ): Promise<void> {
    this.gameService.findOne(roomId)

    client.leave(roomId)
  }

  @SubscribeMessage('game:start')
  async handleStart(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: IUserSocket
  ): Promise<void> {
    const room = this.gameService.findOne(roomId)

    if (!room) throw new RoomNotFound()
    // todo: check if the room is full and not started

    if (room.get().owner.id !== client.request.user.id) {
      return
    }

    room.startGame()
  }

  @SubscribeMessage('game:move')
  async handleMove(
    @MessageBody() data: { roomId: string; posX: number },
    @ConnectedSocket() client: IUserSocket
  ): Promise<void> {
    const room = this.gameService.findOne(data.roomId)

    if (!room) throw new RoomNotFound()
    if (data.posX < 0 || data.posX > 1) return
    // todo: check if user is in the room

    await this.gameService.updatePos(
      data.posX,
      client.request.user.id,
      data.roomId
    )
  }
}
