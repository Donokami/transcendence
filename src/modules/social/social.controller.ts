import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Session
} from '@nestjs/common'

import { SocialService } from './social.service'
import { FriendRequestDto } from './dtos/friend-request.dto'
import { ApiOperation } from '@nestjs/swagger'

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
  @ApiOperation({
    summary: 'Accept a friend request',
    operationId: 'acceptFriendRequest',
    description: 'Accept a friend request',
    tags: ['social']
  })
  async acceptFriendRequest(
    @Param('senderId') senderId: string,
    @Session() session: any
  ) {
    const receiverId = session.userId

    return this.socialService.acceptFriendRequest(receiverId, senderId)
  }

  // ********* //
  // blockUser //
  // ********* //

  @Put('/friendship/:userToBlockId/block')
  @ApiOperation({
    summary: 'Block a user',
    operationId: 'blockUser',
    description: 'Block a user',
    tags: ['social']
  })
  async blockUser(
    @Param('userToBlockId') userToBlockId: string,
    @Session() session: any
  ) {
    const userId = session.userId

    return this.socialService.blockUser(userId, userToBlockId)
  }

  // ************ //
  // getBlockerId //
  // ************ //

  @Get('/blocker-id/:loggedUserId/:observedUserId')
  @ApiOperation({
    summary: 'Get blocker id',
    operationId: 'getBlockerId',
    description: 'Get blocker id',
    tags: ['social']
  })
  async getBlockerId(
    @Param('loggedUserId') loggedUserId: string,
    @Param('observedUserId') observedUserId: string
  ) {
    const blockerId = await this.socialService.getBlockerId(
      loggedUserId,
      observedUserId
    )
    return blockerId
  }

  // ************* //
  // getFriendList //
  // ************* //

  @Get('/:id/friend-list')
  @ApiOperation({
    summary: 'Get friend list',
    operationId: 'acceptFriendRequest',
    description: 'Get friend list for the given user id',
    tags: ['social']
  })
  async getFriendList(@Param('id') id: string) {
    const friendList = await this.socialService.getFriendList(id)
    return friendList
  }

  // ***************** //
  // getFriendRequests //
  // ***************** //

  @Get('/:id/friend-requests')
  @ApiOperation({
    summary: 'Get friend requests',
    operationId: 'getFriendRequests',
    description: 'Get friend requests for the given user id',
    tags: ['social']
  })
  async getFriendRequests(@Param('id') id: string) {
    const friendRequests = await this.socialService.getFriendRequests(id)
    return friendRequests
  }

  // ******************* //
  // rejectFriendRequest //
  // ******************* //

  @Put('/friendship/request/:senderId/reject')
  @ApiOperation({
    summary: 'Reject a friend request',
    operationId: 'rejectFriendRequest',
    description: 'Reject a friend request',
    tags: ['social']
  })
  async rejectFriendRequest(
    @Param('senderId') senderId: string,
    @Session() session: any
  ) {
    const receiverId = session.userId

    return this.socialService.rejectFriendRequest(receiverId, senderId)
  }

  // ***************** //
  // sendFriendRequest //
  // ***************** //

  @Post('/friendship/request')
  @ApiOperation({
    summary: 'Send a friend request',
    operationId: 'sendFriendRequest',
    description: 'Send a friend request',
    tags: ['social']
  })
  async sendFriendRequest(
    @Body() friendRequestDto: FriendRequestDto,
    @Session() session: any
  ) {
    const senderId = session.userId

    return await this.socialService.sendFriendRequest(
      senderId,
      friendRequestDto.receiverId
    )
  }

  // *********** //
  // unblockUser //
  // *********** //

  @Put('/friendship/:userToUnblockId/unblock')
  @ApiOperation({
    summary: 'Unblock a user',
    operationId: 'unblockUser',
    description: 'Unblock a user',
    tags: ['social']
  })
  async unblockUser(
    @Param('userToUnblockId') userToUnblockId: string,
    @Session() session: any
  ) {
    const userId = session.userId

    return await this.socialService.unblockUser(userId, userToUnblockId)
  }
}
