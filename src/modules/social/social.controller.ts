import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Session,
  UseFilters,
  UseGuards
} from '@nestjs/common'
import { ApiOperation } from '@nestjs/swagger'

import { GlobalExceptionFilter } from '@/core/filters/global-exception.filters'
import { AuthGuard } from '@/core/guards/auth.guard'
import { ISession } from '@/core/types'
import { SocialService } from '@/modules/social/social.service'
import { HandleBlockDto } from '@/modules/social/dtos/handle-block-dto'
import { HandleFriendRequestDto } from '@/modules/social/dtos/handle-friend-request.dto'
import { SendFriendRequestDto } from '@/modules/social/dtos/send-friend-request.dto'
import { Friendship } from '@/modules/social/entities/friendship.entity'
import { User } from '@/modules/users/user.entity'

@Controller('social')
@UseFilters(new GlobalExceptionFilter())
export class SocialController {
  // *********** //
  // CONSTRUCTOR //
  // *********** //

  constructor(private readonly socialService: SocialService) {}

  // ******************* //
  // acceptFriendRequest //
  // ******************* //

  @Put('/friendship/request/accept')
  @ApiOperation({
    summary: 'Accept a friend request',
    operationId: 'acceptFriendRequest',
    description: 'Accept a friend request',
    tags: ['social']
  })
  @UseGuards(AuthGuard)
  async acceptFriendRequest(
    @Body() handleFriendRequestDto: HandleFriendRequestDto,
    @Session() session: ISession
  ): Promise<Friendship> {
    const senderId = handleFriendRequestDto.senderId
    const receiverId = session.userId

    return this.socialService.handleFriendRequest(
      'accept',
      senderId,
      receiverId
    )
  }

  // ********* //
  // blockUser //
  // ********* //

  @Put('/friendship/block')
  @ApiOperation({
    summary: 'Block a user',
    operationId: 'blockUser',
    description: 'Block a user',
    tags: ['social']
  })
  @UseGuards(AuthGuard)
  async blockUser(
    @Body() handleBlockDto: HandleBlockDto,
    @Session() session: ISession
  ): Promise<Friendship> {
    const userId = session.userId
    const userToBlockId = handleBlockDto.targetId
    return this.socialService.blockUser(userId, userToBlockId)
  }

  // ************ //
  // getBlockerId //
  // ************ //

  // todo: voir avec Arthur pour le type de retour et pour enlever observedUserId de la route (impossible de passer par le body ?)
  @Get('/get/blocker-id/:observedUserId')
  @ApiOperation({
    summary: 'Get blocker id',
    operationId: 'getBlockerId',
    description: 'Get blocker id',
    tags: ['social']
  })
  @UseGuards(AuthGuard)
  async getBlockerId(
    @Session() session: ISession,
    @Param('observedUserId') observedUserId: string
  ): Promise<{ blockerId: string }> {
    const blockerId = await this.socialService.getBlockerId(
      session.userId,
      observedUserId
    )
    return { blockerId }
  }

  // ************* //
  // getFriendList //
  // ************* //

  @Get('/get/friend-list')
  @ApiOperation({
    summary: 'Get friend list',
    operationId: 'acceptFriendRequest',
    description: 'Get friend list for the given user id',
    tags: ['social']
  })
  @UseGuards(AuthGuard)
  async getFriendList(@Session() session: ISession): Promise<User[]> {
    const friendList = await this.socialService.getFriendList(session.userId)
    return friendList
  }

  // ***************** //
  // getFriendRequests //
  // ***************** //

  @Get('/get/friend-requests')
  @ApiOperation({
    summary: 'Get friend requests',
    operationId: 'getFriendRequests',
    description: 'Get friend requests for the given user id',
    tags: ['social']
  })
  @UseGuards(AuthGuard)
  async getFriendRequests(@Session() session: ISession): Promise<Friendship[]> {
    const friendRequests = await this.socialService.getUserFriendRequests(
      session.userId
    )
    return friendRequests
  }

  // ******************* //
  // rejectFriendRequest //
  // ******************* //

  @Put('/friendship/request/reject')
  @ApiOperation({
    summary: 'Reject a friend request',
    operationId: 'rejectFriendRequest',
    description: 'Reject a friend request',
    tags: ['social']
  })
  @UseGuards(AuthGuard)
  async rejectFriendRequest(
    @Body() handleFriendRequestDto: HandleFriendRequestDto,
    @Session() session: ISession
  ): Promise<Friendship> {
    const senderId = handleFriendRequestDto.senderId
    const receiverId = session.userId

    return this.socialService.handleFriendRequest(
      'reject',
      senderId,
      receiverId
    )
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
  @UseGuards(AuthGuard)
  async sendFriendRequest(
    @Body() sendFriendRequestDto: SendFriendRequestDto,
    @Session() session: ISession
  ): Promise<Friendship> {
    const senderId = session.userId
    const receiverId = sendFriendRequestDto.receiverId
    return await this.socialService.sendFriendRequest(senderId, receiverId)
  }

  // *********** //
  // unblockUser //
  // *********** //

  // DONE
  @Put('/friendship/unblock')
  @ApiOperation({
    summary: 'Unblock a user',
    operationId: 'unblockUser',
    description: 'Unblock a user',
    tags: ['social']
  })
  @UseGuards(AuthGuard)
  async unblockUser(
    @Body() handleBlockDto: HandleBlockDto,
    @Session() session: ISession
  ): Promise<Friendship> {
    const unblockerId = session.userId
    const userToUnblockId = handleBlockDto.targetId
    return await this.socialService.unblockUser(unblockerId, userToUnblockId)
  }
}
