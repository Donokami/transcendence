////////////////////////////////////
// ARTHUR VERSION OF CHAT GATEWAY //
////////////////////////////////////

// import { Logger } from '@nestjs/common';

// import { Server, Socket } from 'socket.io';

// import {
//   ConnectedSocket,
//   MessageBody,
//   SubscribeMessage,
//   WebSocketGateway,
//   WebSocketServer,
// } from '@nestjs/websockets';

// import { UserSocket } from '@/core/types/socket';

// import { ChannelsService } from '@/modules/channels/channels.service';
// import { UsersService } from '@/modules/users/users.service';

// import { BanUserDto } from './dtos/ban-user.dto';
// import { KickUserDto } from './dtos/kick-user.dto';

// // @UsePipes(new ValidationPipe())
// @WebSocketGateway({
//   namespace: '/chat',
//   transport: ['websocket', 'polling'],
// })
// export class ChatGateway {
//   @WebSocketServer()
//   server: Server;

//   // todo: create a connectedUsers map
//   // connectedUsers: Map<string, string> = new Map();

//   // ************ //
//   // CONSTRUCTORS //
//   // ************ //

//   constructor(
//     private readonly userService: UsersService,
//     private readonly channelService: ChannelsService,
//   ) {}

//   // ****** //
//   // LOGGER //
//   // ****** //

//   private logger = new Logger(ChatGateway.name);

//   // ***************** //
//   // GATEWAY FUNCTIONS //
//   // ***************** //

//   // ***************** //
//   // getClientByUserId //
//   // ***************** //

//   // **************** //
//   // handleConnection //
//   // **************** //

//   async handleConnection(client: UserSocket): Promise<void> {
//     const channelId = client.handshake.query.channelId as string;

//     client.emit('connection', 'Successfully connected to chat server');

//     const channel = await this.channelService.findOne(channelId);
//     if (!channel) {
//       client.emit('error', `Channel ${channelId} not found`);
//       return;
//     }

//     client.join(channelId);

//     this.logger.verbose(
//       `Client ${client.id} connected to channel with ID : ${channelId}`,
//     );
//   }

//   // **************** //
//   // handleDisconnect //
//   // **************** //

//   async handleDisconnect(client: UserSocket) {
//     // todo: implement leave function in channelService
//     const channelId = client.handshake.query.channelId as string;
//     this.channelService
//       .leave(channelId, client.request.user.id)
//       .catch((err) => {});
//     this.logger.verbose(`Client ${client.id} disconnected`);
//     client.emit('disconnection', 'Successfully disconnected from chat server');
//   }

//   // ********** //
//   // handleJoin //
//   // ********** //

//   @SubscribeMessage('join')
//   async handleJoin(
//     @MessageBody() channelId: string,
//     @ConnectedSocket() client: UserSocket,
//   ): Promise<void> {
//     const channel = await this.channelService.findOneWithRelations(channelId);

//     if (!channel) {
//       client.emit('error', `Channel with ID : ${channelId} not found`);
//       return;
//     }

//     // todo: implement join function in channelService
//     this.channelService
//       .join(channelId, client.request.user.id)
//       .catch((err) => {});

//     client.join(channelId);

//     this.server.to(channelId).emit('channel:update', channelId);
//   }

//   // *********** //
//   // handleLeave //
//   // *********** //

//   @SubscribeMessage('leave')
//   async handleLeave(
//     @MessageBody() channelId: string,
//     @ConnectedSocket() client: UserSocket,
//   ): Promise<void> {
//     const channel = await this.channelService.findOneWithRelations(channelId);
//     if (!channel) {
//       client.emit('error', `Channel with ID : ${channelId} not found`);
//       return;
//     }

//     client.leave(channelId);
//   }

//   // ************* //
//   // handleMessage //
//   // ************* //

//   @SubscribeMessage('message')
//   async handleMessage(
//     @MessageBody() senderId: string,
//     @MessageBody() receiverId: string,
//     @MessageBody() message: string,
//     @MessageBody() channelId: string,
//     @ConnectedSocket() client: Socket,
//   ): Promise<void> {}

//   // ************* //
//   // handleUserBan //
//   // ************* //

//   @SubscribeMessage('user-ban')
//   async handleUserBan(client: UserSocket, banUserDto: BanUserDto) {}

//   // ************** //
//   // handleUserKick //
//   // ************** //

//   @SubscribeMessage('user-kick')
//   async handleUserKick(client: UserSocket, kickUserDto: KickUserDto) {}
// }

/////////////////////////////////////////
// BOILERPLATE VERSION OF CHAT GATEWAY //
/////////////////////////////////////////

// import {
//   ForbiddenException,
//   Logger,
//   UsePipes,
//   ValidationPipe,
// } from '@nestjs/common';

// import { Server, Socket } from 'socket.io';

// import {
//   ConnectedSocket,
//   MessageBody,
//   OnGatewayConnection,
//   OnGatewayDisconnect,
//   SubscribeMessage,
//   WebSocketGateway,
//   WebSocketServer,
// } from '@nestjs/websockets';

// import { UserSocket } from '@/core/types/socket';

// import { ChannelsService } from '@/modules/channels/channels.service';
// import { UsersService } from '@/modules/users/users.service';

// import { AddMessageDto } from './dtos/add-message.dto';
// import { BanUserDto } from './dtos/ban-user.dto';
// import { JoinChannelDto } from './dtos/join-channel.dto';
// import { KickUserDto } from './dtos/kick-user.dto';
// import { LeaveChannelDto } from './dtos/leave-channel.dto';

// @UsePipes(new ValidationPipe())
// @WebSocketGateway({
//   namespace: '/chat',
//   transport: ['websocket', 'polling'],
// })
// export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
//   @WebSocketServer()
//   server: Server;

//   connectedUsers: Map<string, string> = new Map();

//   // ************ //
//   // CONSTRUCTORS //
//   // ************ //

//   constructor(
//     private readonly userService: UsersService,
//     private readonly channelService: ChannelsService,
//   ) {}

//   // ****** //
//   // LOGGER //
//   // ****** //

//   private logger = new Logger(ChatGateway.name);

//   // ***************** //
//   // GATEWAY FUNCTIONS //
//   // ***************** //

//   // ***************** //
//   // getClientByUserId //
//   // ***************** //

//   private getClientByUserId(userId: string): Socket | null {
//     for (const [key, value] of this.connectedUsers.entries()) {
//       if (value === userId) {
//         return this.server.sockets.sockets.get(key);
//       }
//     }
//     return null;
//   }

//   // **************** //
//   // handleConnection //
//   // **************** //

//   async handleConnection(client: UserSocket): Promise<void> {
//     const { user } = client.request;
//     const channel = user?.channel;
//     this.connectedUsers.set(client.id, user.id);
//     if (channel) {
//       return this.handleJoin(client, { channelId: channel.id });
//     }
//   }

//   // **************** //
//   // handleDisconnect //
//   // **************** //

//   async handleDisconnect(client: UserSocket) {
//     this.connectedUsers.delete(client.id);
//   }

//   // ********** //
//   // handleJoin //
//   // ********** //

//   @SubscribeMessage('join')
//   async handleJoin(client: UserSocket, joinChannelDto: JoinChannelDto) {
//     const { channelId } = joinChannelDto;
//     const limit = 10;

//     const channel = await this.channelService.findOneWithRelations(channelId);

//     if (!channel) return;

//     const userId = this.connectedUsers.get(client.id);
//     const messages = channel.messages.slice(limit * -1);

//     await this.userService.updateUserChannel(userId, channel);

//     client.join(channelId);

//     client.emit('message', messages);
//   }

//   // *********** //
//   // handleLeave //
//   // *********** //

//   @SubscribeMessage('leave')
//   async handleLeave(client: UserSocket, leavechannelDto: LeaveChannelDto) {
//     const { channelId } = leavechannelDto;
//     const userId = this.connectedUsers.get(client.id);

//     await this.userService.updateUserChannel(userId, null);

//     client.leave(channelId);
//   }

//   // ************* //
//   // handleMessage //
//   // ************* //

//   @SubscribeMessage('message')
//   async handleMessage(client: UserSocket, addMessageDto: AddMessageDto) {
//     const userId = this.connectedUsers.get(client.id);
//     const user = await this.userService.findOneById(userId);

//     if (!user.channel) {
//       return;
//     }

//     addMessageDto.userId = userId;
//     addMessageDto.channelId = user.channel.id;

//     await this.channelService.addMessage(addMessageDto);

//     client.to(user.channel.id).emit('message', addMessageDto.messageBody);
//   }

//   // ************* //
//   // handleUserBan //
//   // ************* //
//   @SubscribeMessage('user-ban')
//   async handleUserBan(client: UserSocket, banUserDto: BanUserDto) {
//     const userId = this.connectedUsers.get(client.id);

//     const channel = await this.channelService.findOneWithRelations(
//       banUserDto.channelId,
//     );

//     if (userId !== channel.ownerId) {
//       throw new ForbiddenException(`You are not the owner of the channel!`);
//     }
//     if (userId === banUserDto.userId) {
//       throw new ForbiddenException(`You can't ban yourself`);
//     }
//     if (banUserDto.userId === channel.ownerId) {
//       throw new ForbiddenException(`You can't ban the owner of the channel!`);
//     }

//     await this.channelService.banUserFromChannel(banUserDto);

//     const bannedClient = this.getClientByUserId(banUserDto.userId);
//     if (!bannedClient) {
//       return;
//     }

//     client.to(bannedClient.id).emit('banned', banUserDto.reason);

//     bannedClient.leave(banUserDto.channelId);
//   }

//   // ************** //
//   // handleUserKick //
//   // ************** //

//   @SubscribeMessage('user-kick')
//   async handleUserKick(client: UserSocket, kickUserDto: KickUserDto) {
//     const userId = this.connectedUsers.get(client.id);

//     const channel = await this.channelService.findOneWithRelations(
//       kickUserDto.channelId,
//     );

//     if (userId !== channel.ownerId) {
//       throw new ForbiddenException(`You are not the owner of the channel!`);
//     }
//     if (userId === kickUserDto.userId) {
//       throw new ForbiddenException(`You can't kick yourself`);
//     }
//     if (kickUserDto.userId === channel.ownerId) {
//       throw new ForbiddenException(`You can't kick the owner of the channel!`);
//     }

//     await this.userService.updateUserChannel(kickUserDto.userId, null);

//     const kickedClient = this.getClientByUserId(kickUserDto.userId);
//     if (!kickedClient) {
//       return;
//     }

//     client.to(kickedClient.id).emit('kicked', kickUserDto.reason);

//     kickedClient.leave(kickUserDto.channelId);
//   }
// }

////////////////////////////////////
// HYBRID VERSION OF CHAT GATEWAY //
////////////////////////////////////

import {
  Inject,
  Logger,
  UsePipes,
  ValidationPipe,
  forwardRef
} from '@nestjs/common'

import { Server } from 'socket.io'

import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets'

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

  connectedUsers: Map<string, string> = new Map()

  // ************ //
  // CONSTRUCTORS //
  // ************ //

  constructor(
    private readonly userService: UsersService,
    @Inject(forwardRef(() => ChannelsService))
    private readonly channelService: ChannelsService
  ) {}

  // ****** //
  // LOGGER //
  // ****** //

  private logger = new Logger(ChatGateway.name)

  // ***************** //
  // GATEWAY FUNCTIONS //
  // ***************** //

  // **************** //
  // handleConnection //
  // **************** //

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

    client.emit('connection', 'Successfully connected to chat server.')
  }

  // **************** //
  // handleDisconnect //
  // **************** //

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
        this.server
          .to(channel.id)
          .emit(
            'chat:disconnect',
            `User with ID : ${user.id} disconnected from chat server`
          )
      })
    }
  }
}
