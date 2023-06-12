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
    console.log(
      `[DEBUG] - BACK - handleConnection called in chat.gateway.ts (client id = : ${client.id})`,
    );

    // const cli = client;
    // console.dir(cli);

    const cookieTest = client.handshake.headers.cookie;
    // console.log(`cookieTest = ${cookieTest}`);

    // const sessionId = client.handshake.headers.cookie
    //   .split('; ')
    //   .find((cookie: string) => cookie.startsWith('session'))
    //   .split('=')[1];

    // const user = await this.userService.findOne(sessionId);
    // const channel = user?.channel;
    // this.connectedUsers.set(client.id, user.id);
    // if (channel) {
    //   return this.onChannelJoin(client, { channelId: channel.id });
    // }
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

    await this.userService.updateUserChannel(userId, channel);

    client.join(channelId);

    client.emit('message', messages);
  }

  @SubscribeMessage('leave')
  async onChannelLeave(client: Socket, leavechannelDto: LeaveChannelDto) {
    const { channelId } = leavechannelDto;
    const userId = this.connectedUsers.get(client.id);

    await this.userService.updateUserChannel(userId, null);

    client.leave(channelId);
  }

  // @SubscribeMessage('user-kick')
  // async onUserKick(client: Socket, kickUserDto: KickUserDto) {
  //   const { roomId, reason } = kickUserDto;

  //   const userId = this.connectedUsers.get(client.id);
  //   const room = await this.roomService.findOneWithRelations(roomId);

  //   if (userId !== room.ownerId) {
  //     throw new ForbiddenException(`You are not the owner of the room!`);
  //   }

  //   await this.userService.updateUserRoom(kickUserDto.userId, null);

  //   const kickedClient = this.getClientByUserId(kickUserDto.userId);

  //   if (!kickedClient) return;

  //   client.to(kickedClient.id).emit('kicked', reason);
  //   kickedClient.leave(roomId);
  // }

  // @SubscribeMessage('user-ban')
  // async onUserBan(client: Socket, banUserDto: BanUserDto) {
  //   const { channelId, reason } = banUserDto;

  //   const userId = this.connectedUsers.get(client.id);
  //   const channel = await this.channelService.findOneWithRelations(channelId);

  //   if (userId !== channel.ownerId) {
  //     throw new ForbiddenException(`You are not the owner of the channel!`);
  //   }

  //   if (userId === banUserDto.userId) {
  //     throw new ForbiddenException(`You can't ban yourself`);
  //   }

  //   await this.channelService.banUserFromChannel(banUserDto);

  //   const bannedClient = this.getClientByUserId(banUserDto.userId);

  //   if (!bannedClient) return;

  //   client.to(bannedClient.id).emit('banned', reason);
  //   bannedClient.leave(channelId);
  // }

  private getClientByUserId(userId: string): Socket | null {
    for (const [key, value] of this.connectedUsers.entries()) {
      if (value === userId) {
        return this.server.sockets.sockets.get(key);
      }
    }
    return null;
  }
}
