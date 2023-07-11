import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Session,
} from '@nestjs/common';

import { SocialService } from './social.service';
import { FriendRequestDto } from './dtos/friend-request.dto';

@Controller('social')
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  // ***************** //
  // sendFriendRequest //
  // ***************** //

  @Post('/friendship/request')
  async sendFriendRequest(
    @Body() friendRequestDto: FriendRequestDto,
    @Session() session: any,
  ) {
    const senderId = session.userId;

    return await this.socialService.sendFriendRequest(
      senderId,
      friendRequestDto.receiverId,
    );
  }

  // ***************** //
  // getFriendRequests //
  // ***************** //

  @Get('/:id/friend-requests')
  async getFriendRequests(@Param('id') id: string) {
    const friendRequests = await this.socialService.getFriendRequests(id);
    return friendRequests;
  }

  // ************* //
  // getFriendList //
  // ************* //

  @Get('/:id/friend-list')
  async getFriendList(@Param('id') id: string) {
    const friendList = await this.socialService.getFriendList(id);
    return friendList;
  }

  // ************** //
  // getBlockedList //
  // ************** //

  @Get('/:id/blocked-list')
  async getBlockedList(@Param('id') id: string) {
    const blockedList = await this.socialService.getBlockedList(id);
    return blockedList;
  }

  // ******************* //
  // acceptFriendRequest //
  // ******************* //

  @Put('/friendship/request/:senderId/accept')
  async acceptFriendRequest(
    @Param('senderId') senderId: string,
    @Session() session: any,
  ) {
    const receiverId = session.userId;

    return await this.socialService.acceptFriendRequest(receiverId, senderId);
  }

  // ******************* //
  // rejectFriendRequest //
  // ******************* //

  @Put('/friendship/request/:senderId/reject')
  async rejectFriendRequest(
    @Param('senderId') senderId: string,
    @Session() session: any,
  ) {
    const receiverId = session.userId;

    return await this.socialService.rejectFriendRequest(receiverId, senderId);
  }

  // ********* //
  // blockUser //
  // ********* //

  @Put('/friendship/:userToBlockId/block')
  async blockUser(
    @Param('userToBlockId') userToBlockId: string,
    @Session() session: any,
  ) {
    const userId = session.userId;

    return await this.socialService.blockUser(userId, userToBlockId);
  }

  // *********** //
  // unblockUser //
  // *********** //

  @Put('/friendship/:userToUnblockId/unblock')
  async unblockUser(
    @Param('userId') userToUnblockId: string,
    @Session() session: any,
  ) {
    const userId = session.userId;

    return await this.socialService.unblockUser(userId, userToUnblockId);
  }
}
