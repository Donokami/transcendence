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
  // *********** //
  // CONSTRUCTOR //
  // *********** //

  constructor(private readonly socialService: SocialService) {}

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

  // ********* //
  // blockUser //
  // ********* //

  @Put('/friendship/:userToBlockId/block')
  async blockUser(
    @Param('userToBlockId') userToBlockId: string,
    @Session() session: any,
  ) {
    const userId = session.userId;

    return this.socialService.blockUser(userId, userToBlockId);
  }

  // ************ //
  // getBlockerId //
  // ************ //

  @Get('/blocker-id/:loggedUserId/:observedUserId/')
  async getBlockerId(
    @Param('loggedUserId') loggedUserId: string,
    @Param('observedUserId') observedUserId: string,
  ) {
    const blockerId = await this.socialService.getBlockerId(
      loggedUserId,
      observedUserId,
    );
    return blockerId;
  }

  // ************* //
  // getFriendList //
  // ************* //

  @Get('/:id/friend-list')
  async getFriendList(@Param('id') id: string) {
    const friendList = await this.socialService.getFriendList(id);
    return friendList;
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

  // *********** //
  // unblockUser //
  // *********** //

  @Put('/friendship/:userToUnblockId/unblock')
  async unblockUser(
    @Param('userToUnblockId') userToUnblockId: string,
    @Session() session: any,
  ) {
    const userId = session.userId;

    return await this.socialService.unblockUser(userId, userToUnblockId);
  }
}
