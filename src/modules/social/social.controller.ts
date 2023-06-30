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

    return this.socialService.sendFriendRequest(
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

  // ******************* //
  // acceptFriendRequest //
  // ******************* //

  @Put('/friendship/request/:senderId/accept')
  async acceptFriendRequest(
    @Param('senderId') senderId: string,
    @Session() session: any,
  ) {
    const receiverId = session.userId;

    return this.socialService.acceptFriendRequest(receiverId, senderId);
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

    return this.socialService.rejectFriendRequest(receiverId, senderId);
  }

  // ********* //
  // blockUser //
  // ********* //

  @Put('/friendship/:userId/block')
  async blockUser(
    @Param('userId') userIdToBlock: string,
    @Session() session: any,
  ) {
    const userId = session.userId;

    return this.socialService.blockUser(userId, userIdToBlock);
  }

  // *********** //
  // unblockUser //
  // *********** //

  @Put('/friendship/:userId/unblock')
  async unblockUser(
    @Param('userId') userIdToUnblock: string,
    @Session() session: any,
  ) {
    const userId = session.userId;

    return this.socialService.unblockUser(userId, userIdToUnblock);
  }
}
