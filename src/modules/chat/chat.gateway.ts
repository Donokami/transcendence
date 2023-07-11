import {
  ForbiddenException,
  UsePipes,
  ValidationPipe,
  Logger,
} from '@nestjs/common';

import {
  type OnGatewayConnection,
  type OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';

import { session } from '@/app.module';
import { type UserSocket } from '@/core/types/socket';
import { UsersService } from '@/modules/users/users.service';
import { ChannelsService } from '@/modules/channels/channels.service';

import { AddMessageDto } from './dtos/add-message.dto';
import { JoinChannelDto } from './dtos/join-channel.dto';
import { LeaveChannelDto } from './dtos/leave-channel.dto';
import { KickUserDto } from './dtos/kick-user.dto';
import { BanUserDto } from './dtos/ban-user.dto';

@UsePipes(new ValidationPipe())
@WebSocketGateway({
  namespace: '/chat',
  transport: ['websocket', 'polling'],
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ChatGateway.name);

  @WebSocketServer()
  server: Server;

  connectedUsers = new Map<string, string>();

  constructor(
    private readonly userService: UsersService,
    private readonly channelService: ChannelsService,
  ) {}

  async handleConnection(client: UserSocket): Promise<void> {
    const { user } = client.request;
    const channel = user?.channel;

    this.connectedUsers.set(client.id, user.id);

    if (channel) {
      await this.onChannelJoin(client, { channelId: channel.id });
    }
  }

  async handleDisconnect(client: Socket) {
    this.connectedUsers.delete(client.id);
  }

  @SubscribeMessage('message')
  async onMessage(client: Socket, addMessageDto: AddMessageDto) {
    const userId = this.connectedUsers.get(client.id);
    const user = await this.userService.findOneById(userId);

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

  @SubscribeMessage('user-kick')
  async onUserKick(client: Socket, kickUserDto: KickUserDto) {
    const userId = this.connectedUsers.get(client.id);

    const channel = await this.channelService.findOneWithRelations(
      kickUserDto.channelId,
    );

    if (userId !== channel.ownerId) {
      throw new ForbiddenException('You are not the owner of the channel!');
    }
    if (userId === kickUserDto.userId) {
      throw new ForbiddenException("You can't kick yourself");
    }
    if (kickUserDto.userId === channel.ownerId) {
      throw new ForbiddenException("You can't kick the owner of the channel!");
    }

    await this.userService.updateUserChannel(kickUserDto.userId, null);

    const kickedClient = this.getClientByUserId(kickUserDto.userId);
    if (!kickedClient) {
      return;
    }

    client.to(kickedClient.id).emit('kicked', kickUserDto.reason);

    kickedClient.leave(kickUserDto.channelId);
  }

  @SubscribeMessage('user-ban')
  async onUserBan(client: Socket, banUserDto: BanUserDto) {
    const userId = this.connectedUsers.get(client.id);

    const channel = await this.channelService.findOneWithRelations(
      banUserDto.channelId,
    );

    if (userId !== channel.ownerId) {
      throw new ForbiddenException('You are not the owner of the channel!');
    }
    if (userId === banUserDto.userId) {
      throw new ForbiddenException("You can't ban yourself");
    }
    if (banUserDto.userId === channel.ownerId) {
      throw new ForbiddenException("You can't ban the owner of the channel!");
    }

    await this.channelService.banUserFromChannel(banUserDto);

    const bannedClient = this.getClientByUserId(banUserDto.userId);
    if (!bannedClient) {
      return;
    }

    client.to(bannedClient.id).emit('banned', banUserDto.reason);

    bannedClient.leave(banUserDto.channelId);
  }

  private getClientByUserId(userId: string): Socket | null {
    for (const [key, value] of this.connectedUsers.entries()) {
      if (value === userId) {
        return this.server.sockets.sockets.get(key);
      }
    }
    return null;
  }
}
