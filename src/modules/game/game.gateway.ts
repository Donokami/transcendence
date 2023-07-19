import { Inject, Logger, forwardRef } from '@nestjs/common'

import { Server, Socket } from 'socket.io'

import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets'

import { UserSocket } from '@/core/types/socket'

import { GameService } from './game.service'

@WebSocketGateway({
  namespace: '/game',
  transport: ['websocket', 'polling']
})
export class GameGateway {
  @WebSocketServer()
  server: Server

  // ************ //
  // CONSTRUCTORS //
  // ************ //

  constructor(
    @Inject(forwardRef(() => GameService))
    private gameService: GameService
  ) {}

  // ****** //
  // LOGGER //
  // ****** //

  private readonly logger = new Logger(GameService.name)

  // ***************** //
  // GATEWAY FUNCTIONS //
  // ***************** //

  // **************** //
  // handleConnection //
  // **************** //

  async handleConnection(client: Socket) {
    this.logger.verbose(`Client ${client.id} connected to /game socket`)
  }

  // **************** //
  // handleDisconnect //
  // **************** //

  handleDisconnect(client: UserSocket) {
    // const roomId = client.handshake.query.roomId as string
    // this.gameService.leave(roomId, client.request.user.id).catch((err) => {})
    this.gameService.leaveAll(client.request.user.id)
    this.logger.verbose(`Client ${client.id} disconnected`)
    client.emit('disconnection', 'Successfully disconnected from game server')
  }

  @SubscribeMessage('room:join')
  async handleJoin(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: UserSocket
  ): Promise<void> {
    const { data: room, error: roomError } = await this.gameService.findOne(
      roomId
    )

    // if (roomError) {
    //   this.logger.error(roomError)
    //   client.emit('error', roomError)
    //   return
    // }

    const { error } = await this.gameService.join(
      roomId,
      client.request.user.id
    )

    // if (error) {
    //   client.emit('error', error)
    //   this.logger.error(error)
    //   return
    // }

    client.join(roomId)

    this.server.to(roomId).emit('room:update', room.get())
  }

  @SubscribeMessage('room:leave')
  async handleLeave(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: Socket
  ): Promise<void> {
    const { error } = await this.gameService.findOne(roomId)

    if (error) {
      client.emit('error', error)
      this.logger.error(error)
      return
    }

    client.leave(roomId)
  }

  @SubscribeMessage('game:start')
  async handleStart(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: UserSocket
  ): Promise<void> {
    const { data: room, error } = await this.gameService.findOne(roomId)

    // todo: to test after implementing all the game logic
    if (error) {
      client.emit('error', error)
      return
    }

    // todo: check if the room is full and not started

    // if (room.get().owner.id !== client.request.user.id) {
    //   client.emit('error', 'You are not the owner of this room')
    //   return
    // }

    room.startGame()
  }
}
