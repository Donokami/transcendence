import { Body, Controller, Param, Post, Put, Session } from '@nestjs/common';

import { SocialService } from './social.service';

@Controller('social')
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  // ***************** //
  // sendFriendRequest //
  // ***************** //

  @Post('/friendship/request')
  async sendFriendRequest(
    @Body('receiverId') receiverId: string,
    @Session() session: any,
  ) {
    const senderId = session.userId;

    return this.socialService.sendFriendRequest(senderId, receiverId);
  }

  // ******************* //
  // acceptFriendRequest //
  // ******************* //

  @Put('/friendship/request/:requestId/accept')
  async acceptFriendRequest(
    @Param('requestId') requestId: string,
    @Session() session: any,
  ) {
    const userId = session.userId;

    return this.socialService.acceptFriendRequest(userId, requestId);
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
