import {
  Inject,
  Logger,
  UsePipes,
  ValidationPipe,
  forwardRef
} from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets'

import { Server, Socket } from 'socket.io'
import { DefaultEventsMap } from 'socket.io/dist/typed-events'

import { IUserSocket } from '@/core/types/socket'
import { ChannelsService } from '@/modules/chat/channels/channels.service'
import { UsersService } from '@/modules/users/users.service'

@UsePipes(new ValidationPipe())
@WebSocketGateway({
  namespace: '/chat',
  transport: ['websocket', 'polling']
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  // todo: try to switch to Map<string, Socket>
  connectedUsers: Map<string, string> = new Map()

  constructor(
    private readonly userService: UsersService,
    @Inject(forwardRef(() => ChannelsService))
    private readonly channelService: ChannelsService
  ) { }

  private logger = new Logger(ChatGateway.name)

  @Cron(CronExpression.EVERY_10_SECONDS)
  async checkMuteTimers(): Promise<void> {
    const channels = await this.channelService.findAllWithMutedMembers()
    channels.forEach(async (channel) => {
      channel.mutedMembers.forEach(async (mutedMember) => {
        await this.channelService.unmuteMember(channel, mutedMember.user.id)

        this.logger.debug(
          `User ${mutedMember.user.username} has been unmuted in channel ${channel.name}.`
        )
      })
    })
  }

  getUserSocket(userId: string): Socket | null {
    const socketId = this.connectedUsers.get(userId)
    if (socketId) {
      const socket = (
        this.server.sockets as unknown as Map<
          string,
          Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
        >
      ).get(socketId)
      return socket
    }
    return null
  }

  async handleConnection(
    @ConnectedSocket() client: IUserSocket
  ): Promise<void> {
    const requestingUser = client.request.user

    const user = await this.userService.findOneByIdWithChannels(
      requestingUser.id
    )

    this.connectedUsers.set(user.id, client.id)

    user.channels.forEach((channel) => {
      client.join(channel.id)
    })

    client.emit('chat:connect', 'Successfully connected to chat server.')
  }

  async handleDisconnect(
    @ConnectedSocket() client: IUserSocket
  ): Promise<void> {
    const requestingUser = client.request.user

    const user = await this.userService.findOneByIdWithChannels(
      requestingUser.id
    )

    this.connectedUsers.delete(user.id)

    if (user && user.channels) {
      user.channels.forEach((channel) => {
        client.leave(channel.id)
      })
    }
  }
}
