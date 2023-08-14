import {
  Injectable,
  Logger,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import {
  OnlyBlockerCanUnblock,
  FriendshipAlreadyAccepted,
  FriendshipAlreadyBlocked,
  FriendshipAlreadyPending,
  FriendshipBlocked,
  FriendshipNotBlocked,
  FriendshipNotFound,
  MissingObservedUserId,
  SameIdsError,
  UserNotFound,
  FriendRequestNotFound,
  OnlyReceiverCanHandleFriendRequest
} from '@/core/exceptions'

import {
  Friendship,
  FriendshipStatus
} from '@/modules/social/entities/friendship.entity'
import { User } from '@/modules/users/user.entity'
import { SocialGateway } from './social.gateway'

@Injectable()
export class SocialService {
  // *********** //
  // CONSTRUCTOR //
  // *********** //

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Friendship)
    private readonly friendshipRepository: Repository<Friendship>,
    private readonly socialGateway: SocialGateway
  ) { }

  // ****** //
  // LOGGER //
  // ****** //

  private logger = new Logger(SocialService.name)

  // ******************** //
  // FUNCTION DEFINITIONS //
  // ******************** //

  // ********* //
  // blockUser //
  // ********* //

  async blockUser(
    blockerId: string,
    userToBlockId: string
  ): Promise<Friendship> {
    if (blockerId === userToBlockId) {
      this.logger.warn(`Users cannot block themselves`)
      throw new SameIdsError()
    }

    const blocker: User = await this.getExistingUser(blockerId)
    const toBlock: User = await this.getExistingUser(userToBlockId)

    const friendship: Friendship = await this.getFriendshipBetweenTwoUsers(
      blockerId,
      userToBlockId
    )

    if (friendship) {
      if (friendship.status === FriendshipStatus.BLOCKED) {
        this.logger.warn(`Friendship status is already blocked.`)
        throw new FriendshipAlreadyBlocked()
      }

      friendship.blockerId = blockerId
      friendship.status = FriendshipStatus.BLOCKED

      await this.friendshipRepository.save(friendship)

      this.logger.verbose(
        `${userToBlockId} has been successfully blocked by ${blockerId}`
      )

      const client = this.socialGateway.findClient(userToBlockId)

      if (client) {
        this.socialGateway.server
          .to(client.clientId)
          .emit('social:block', { blockerId })
      }

      return friendship
    } else {
      const newFriendship = await this.createFriendship(blocker, toBlock)

      newFriendship.blockerId = blockerId
      newFriendship.status = FriendshipStatus.BLOCKED

      await this.friendshipRepository.save(newFriendship)

      this.logger.verbose(
        `${userToBlockId} has been successfully blocked by ${blockerId}`
      )

      const client = this.socialGateway.findClient(userToBlockId)

      if (client) {
        this.socialGateway.server
          .to(client.clientId)
          .emit('social:block', { blockerId })
      }

      return newFriendship
    }
  }

  // ***************** //
  // checkExistingUser //
  // ***************** //

  private async checkExistingUser(userId: string): Promise<number> {
    const userCount: number = await this.usersRepository.count({
      where: { id: userId }
    })
    if (userCount < 1) {
      this.logger.warn(`User with ID : ${userId} not found.`)
      throw new UserNotFound()
    }

    return userCount
  }

  // **************** //
  // createFriendship //
  // *************** //

  private async createFriendship(
    sender: User,
    receiver: User
  ): Promise<Friendship> {
    const friendship = this.friendshipRepository.create({
      sender,
      receiver
    })
    return friendship
  }

  // ************ //
  // getBlockerId //
  // ************ //

  async getBlockerId(
    loggedUserId: string,
    observedUserId: string
  ): Promise<string> {
    if (!observedUserId) {
      this.logger.warn(`Observed user ID is missing.`)
      throw new MissingObservedUserId()
    }

    this.checkExistingUser(loggedUserId)
    this.checkExistingUser(observedUserId)

    const friendship = await this.getFriendshipBetweenTwoUsers(
      loggedUserId,
      observedUserId
    )

    if (friendship && FriendshipStatus.BLOCKED) {
      this.logger.verbose(
        `The friendship between ${loggedUserId} and ${observedUserId} is blocked by ${friendship.blockerId}`
      )
      return friendship.blockerId
    }

    return null
  }

  // *************** //
  // getExistingUser //
  // *************** //

  private async getExistingUser(userId: string): Promise<User> {
    const user: User = await this.usersRepository.findOne({
      where: { id: userId }
    })
    if (!user) {
      this.logger.warn(`User with ID : ${userId} not found.`)
      throw new UserNotFound()
    }
    return user
  }

  // ************* //
  // getFriendList //
  // ************* //

  async getFriendList(userId: string): Promise<User[]> {
    await this.checkExistingUser(userId)

    const friendships: Friendship[] = await this.getUserAccetpedFriendships(
      userId
    )

    if (friendships.length === 0) return []
    else {
      const friendList = friendships.map((friendship: Friendship) => {
        if (friendship.sender.id === userId) {
          return friendship.receiver
        } else {
          return friendship.sender
        }
      })
      this.logger.verbose(`Friend list of : ${userId} successfully retrieved.`)
      return friendList
    }
  }

  // ******************************** //
  // getPendingRequestBetweenTwoUsers //
  // ******************************** //

  private async getPendingRequestBetweenTwoUsers(
    senderId: string,
    receiverId: string
  ): Promise<Friendship> {
    const friendRequest: Friendship = await this.friendshipRepository.findOne({
      where: [
        {
          sender: { id: senderId },
          receiver: { id: receiverId },
          status: FriendshipStatus.PENDING
        }
      ]
    })
    if (!friendRequest) {
      this.logger.warn(
        `Pending friend request sent by : ${senderId} to : ${receiverId} not found.`
      )
      throw new FriendRequestNotFound()
    }

    return friendRequest
  }

  // **************************** //
  // getFriendshipBetweenTwoUsers //
  // **************************** //

  private async getFriendshipBetweenTwoUsers(
    senderId: string,
    receiverId: string
  ): Promise<Friendship> {
    const friendship: Friendship = await this.friendshipRepository.findOne({
      where: [
        {
          sender: { id: senderId },
          receiver: { id: receiverId }
        },
        {
          sender: { id: receiverId },
          receiver: { id: senderId }
        }
      ]
    })

    return friendship
  }

  // ************************** //
  // getUserAccetpedFriendships //
  // ************************** //

  private async getUserAccetpedFriendships(
    userId: string
  ): Promise<Friendship[]> {
    const friendships: Friendship[] = await this.friendshipRepository.find({
      where: [
        { sender: { id: userId }, status: FriendshipStatus.ACCEPTED },
        { receiver: { id: userId }, status: FriendshipStatus.ACCEPTED }
      ]
    })
    if (!friendships) {
      this.logger.warn(`No accepted friendships found for ${userId}.`)
      return []
    }
    return friendships
  }

  // ********************* //
  // getUserFriendRequests //
  // ********************* //

  async getUserFriendRequests(userId: string): Promise<Friendship[]> {
    await this.checkExistingUser(userId)

    const friendRequests = await this.friendshipRepository.find({
      where: {
        receiver: { id: userId },
        status: FriendshipStatus.PENDING
      }
    })

    this.logger.verbose(
      `Friend requests sent to : ${userId} successfully retrieved.`
    )

    return friendRequests
  }

  // ******************* //
  // handleFriendRequest //
  // ******************* //

  async handleFriendRequest(
    action: string,
    senderId: string,
    receiverId: string
  ): Promise<Friendship> {
    if (senderId === receiverId) {
      this.logger.warn(`Sender and receiver cannot have the same id.`)
      throw new SameIdsError()
    }

    this.checkExistingUser(senderId)
    this.checkExistingUser(receiverId)

    const request: Friendship = await this.getPendingRequestBetweenTwoUsers(
      senderId,
      receiverId
    )

    if (request.receiver.id !== receiverId) {
      this.logger.warn(`Only the receiver can handle this friend request.`)
      throw new OnlyReceiverCanHandleFriendRequest()
    }

    if (action === 'accept') {
      request.status = FriendshipStatus.ACCEPTED
      this.logger.verbose(
        `Friend request sent by : ${senderId} to : ${receiverId} accepted.`
      )
      const client = this.socialGateway.findClient(senderId)

      if (client) {
        this.socialGateway.server
          .to(client.clientId)
          .emit('social:accept', request.receiver)
      }
    } else if (action === 'reject') {
      request.status = FriendshipStatus.REJECTED
      this.logger.verbose(
        `Friend request sent by : ${senderId} to : ${receiverId} rejected.`
      )
    }

    await this.friendshipRepository.save(request)

    return request
  }

  // ***************** //
  // sendFriendRequest //
  // ***************** //

  async sendFriendRequest(
    senderId: string,
    receiverId: string
  ): Promise<Friendship> {
    if (senderId === receiverId) {
      this.logger.warn(`Sender and receiver cannot have the same id.`)
      throw new SameIdsError()
    }

    const sender: User = await this.getExistingUser(senderId)
    const receiver: User = await this.getExistingUser(receiverId)

    const friendship = await this.getFriendshipBetweenTwoUsers(
      senderId,
      receiverId
    )

    if (friendship) {
      if (friendship.status === FriendshipStatus.PENDING) {
        this.logger.warn(`A pending friendship already exists in database.`)
        throw new FriendshipAlreadyPending()
      } else if (friendship.status === FriendshipStatus.ACCEPTED) {
        this.logger.warn(`An accepted friendship already exists in database`)
        throw new FriendshipAlreadyAccepted()
      } else if (friendship.status === FriendshipStatus.BLOCKED) {
        this.logger.warn(`A blocked friendship already exists in database`)
        throw new FriendshipBlocked()
      } else if (friendship.status === FriendshipStatus.REJECTED) {
        friendship.status = FriendshipStatus.PENDING
        this.logger.verbose(`Friendship status is now pending.`)

        await this.friendshipRepository.save(friendship)

        const client = this.socialGateway.findClient(receiverId)

        if (client) {
          this.socialGateway.server
            .to(client.clientId)
            .emit('social:new', friendship)
        }

        return friendship
      }
    } else {
      const newFriendship = await this.createFriendship(sender, receiver)

      newFriendship.blockerId = null
      newFriendship.status = FriendshipStatus.PENDING

      await this.friendshipRepository.save(newFriendship)

      this.logger.verbose(
        `Friend request successfully sent by ${senderId} to ${receiverId}.`
      )

      const client = this.socialGateway.findClient(receiverId)

      if (client) {
        this.socialGateway.server
          .to(client.clientId)
          .emit('social:new', friendship)
      }

      return newFriendship
    }
  }

  // *********** //
  // unblockUser //
  // *********** //

  async unblockUser(
    unblockerId: string,
    userToUnblockId: string
  ): Promise<Friendship> {
    if (unblockerId === userToUnblockId) {
      this.logger.warn(`Users cannot unblock themselves`)
      throw new SameIdsError()
    }

    await this.checkExistingUser(unblockerId)
    await this.checkExistingUser(userToUnblockId)

    const friendship = await this.getFriendshipBetweenTwoUsers(
      unblockerId,
      userToUnblockId
    )

    if (!friendship) {
      this.logger.warn(`Friendship to unblock not found.`)
      throw new FriendshipNotFound()
    }

    if (friendship.status !== FriendshipStatus.BLOCKED) {
      this.logger.warn(`The friendship is not blocked.`)
      throw new FriendshipNotBlocked()
    }

    if (unblockerId !== friendship.blockerId) {
      this.logger.warn(
        `Only user with ID : ${friendship.blockerId} can unblock the friendship.`
      )
      throw new OnlyBlockerCanUnblock()
    }

    friendship.blockerId = null
    friendship.status = FriendshipStatus.ACCEPTED

    await this.friendshipRepository.save(friendship)

    this.logger.verbose(
      `${userToUnblockId} has been successfully unblocked by ${unblockerId}`
    )

    return friendship
  }
}
