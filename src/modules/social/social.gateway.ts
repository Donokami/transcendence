import {
  ClassSerializerInterceptor,
  Injectable,
  Logger,
  UseFilters,
  UseInterceptors
} from '@nestjs/common'

import { Server } from 'socket.io'

import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets'

import { IUserSocket } from '@/core/types/socket'

import { GlobalExceptionFilter } from '@/core/filters/global-exception.filters'
import { UsersService } from '@/modules/users/users.service'
import { UserStatus } from '@/modules/users/user.entity'

@WebSocketGateway({
  namespace: '/social',
  transport: ['websocket', 'polling']
})
@UseFilters(new GlobalExceptionFilter())
@UseInterceptors(ClassSerializerInterceptor)
@Injectable()
export class SocialGateway {
  @WebSocketServer()
  server: Server

  connectedSockets: Array<{
    clientId: string
    userId: string
  }> = []

  constructor(private readonly userService: UsersService) {}

  private readonly logger = new Logger(SocialGateway.name)

  async handleConnection(client: IUserSocket) {
    this.userService.update(client.request.user.id, {
      status: UserStatus.ONLINE
    })

    this.connectedSockets.push({
      clientId: client.id,
      userId: client.request.user.id
    })

    this.logger.debug(`Client ${client.id} connected to /social socket`)
    this.server.emit('user:connect', client.request.user.id)
  }

  handleDisconnect(client: IUserSocket) {
    const sockIndex = this.connectedSockets.findIndex(
      (sock) => sock.clientId === client.id
    )

    this.connectedSockets.splice(sockIndex, 1)

    if (
      this.connectedSockets.filter(
        (sock) => sock.userId === client.request.user.id
      ).length > 0
    )
      return
    this.userService.update(client.request.user.id, {
      status: UserStatus.OFFLINE
    })
    this.logger.verbose(`Client ${client.id} disconnected`)
    this.server.emit('user:disconnect', client.request.user.id)
  }

  findClient(userId: string) {
    return this.connectedSockets.find((sock) => sock.userId === userId)
  }
}
