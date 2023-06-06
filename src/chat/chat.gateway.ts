import { ForbiddenException, UsePipes, ValidationPipe } from '@nestjs/common';

import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';

import { UsersService } from '../users/users.service';
import { AuthService } from '../users/auth.service';
import { ChannelsService } from '../channels/channels.service';

import { AddMessageDto } from './dtos/add-message.dto';
import { JoinChannelDto } from './dtos/join-channel.dto';
import { LeaveChannelDto } from './dtos/leave-channel.dto';
import { KickUserDto } from './dtos/kick-user.dto';
import { BanUserDto } from './dtos/ban-user.dto';

@UsePipes(new ValidationPipe())
@WebSocketGateway({
  namespace: '/chat',
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET,POST,DELETE'],
    credentials: true,
  },
  transport: ['websocket', 'polling'],
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  connectedUsers: Map<string, string> = new Map();

  constructor(
    private readonly userService: UsersService,
    private readonly authService: AuthService,
    private readonly channelService: ChannelsService,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    const sessionId = client.handshake.headers.cookie.split('=')[1];
    const session = this.authService.getSessionById(sessionId);

    if (!session || !session.userId) {
      client.disconnect(true);
      return;
    }

    const user = await this.userService.findOne(session.userId);
    const channel = user?.channel;

    this.connectedUsers.set(client.id, user.id);

    if (channel) {
      return this.onChannelJoin(client, { channelId: channel.id });
    }
  }

  async handleDisconnect(client: Socket) {
    this.connectedUsers.delete(client.id);
  }

  @SubscribeMessage('message')
  async onMessage(client: Socket, addMessageDto: AddMessageDto) {
    const userId = this.connectedUsers.get(client.id);
    const user = await this.userService.findOne(userId);

    if (!user.channel) {
      return;
    }

    addMessageDto.userId = userId;
    addMessageDto.channelId = user.channel.id;

    await this.channelService.addMessage(addMessageDto);

    client.to(user.channel.id).emit('message', addMessageDto.messageBody);
  }

  @SubscribeMessage('join')
  async onChannelJoin(client: Socket, joinChannelDto: JoinChannelDto) {
    const { channelId } = joinChannelDto;
    const limit = 10;

    const channel = await this.channelService.findOneWithRelations(channelId);

    if (!channel) return;

    const userId = this.connectedUsers.get(client.id);
    const messages = channel.messages.slice(limit * -1);

    await this.userService.updateUserchannel(userId, channel);

    client.join(channelId);

    client.emit('message', messages);
  }
}
