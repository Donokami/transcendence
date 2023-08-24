import {
  ClassSerializerInterceptor,
  Inject,
  Logger,
  UseFilters,
  UseInterceptors,
  forwardRef
} from '@nestjs/common'

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
import {
  GameAlreadyStarted,
  RoomNotFound,
  UserNotOwner
} from '@/core/exceptions/game'

@WebSocketGateway({
  namespace: '/game',
  transport: ['websocket', 'polling']
})
@UseFilters(new GlobalExceptionFilter())
@UseInterceptors(ClassSerializerInterceptor)
export class GameGateway {
  @WebSocketServer()
  server: Server

  constructor(
    @Inject(forwardRef(() => GameService))
    private gameService: GameService
  ) {}

  private readonly logger = new Logger(GameGateway.name)

  async handleConnection(client: Socket) {
    this.logger.verbose(`Client ${client.id} connected to /game socket`)
  }

  async handleDisconnect(client: IUserSocket) {
    this.gameService.socketLeave(client.id)
    this.logger.verbose(`Client ${client.id} disconnected`)
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

    await this.gameService.join(roomId, client.request.user.id, client.id)

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
    if (room.get().status === 'ingame') throw new GameAlreadyStarted()

    if (room.get().owner.id !== client.request.user.id) {
      throw new UserNotOwner()
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
