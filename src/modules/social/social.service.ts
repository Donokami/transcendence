import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException
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
  MissingBlockerId,
  MissingLoggedUserId,
  MissingObservedUserId,
  MissingReceiverId,
  MissingSenderId,
  MissingToBlockId,
  MissingToUnblockId,
  MissingUnblockerId,
  MissingUserId,
  OnlyReceiverCanAcceptFriendRequest,
  OnlyReceiverCanRejectFriendRequest,
  SameIdsError,
  UserNotFound
} from '@/core/exceptions'

import {
  Friendship,
  FriendshipStatus
} from '@/modules/social/entities/friendship.entity'
import { User } from '@/modules/users/user.entity'

@Injectable()
export class SocialService {
  // *********** //
  // CONSTRUCTOR //
  // *********** //

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Friendship)
    private readonly friendshipRepository: Repository<Friendship>
  ) {}

  // ****** //
  // LOGGER //
  // ****** //

  private logger = new Logger(SocialService.name)

  // ******************** //
  // FUNCTION DEFINITIONS //
  // ******************** //

  // NEW (refactor)
  async checkExistingUser(userId: string): Promise<number> {
    const userCount: number = await this.usersRepository.count({
      where: { id: userId }
    })
    if (userCount < 1) {
      this.logger.warn(`User with ID : ${userId} not found in database.`)
      throw new UserNotFound()
    }

    return userCount
  }

  // NEW (refactor)
  async getExistingUser(userId: string): Promise<User> {
    const user: User = await this.usersRepository.findOne({
      where: { id: userId }
    })
    if (!user) {
      this.logger.warn(`User with ID : ${userId} not found in database.`)
      throw new UserNotFound()
    }
    return user
  }

  // NEW (refactor)
  async getFriendship(
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

  // ******************* //
  // acceptFriendRequest //
  // ******************* //

  // todo (Lucas): check what is best between findOne and count (implies not saving the sender and receiver at then end)
  async acceptFriendRequest(
    receiverId: string,
    senderId: string
  ): Promise<Friendship> {
    if (!receiverId) {
      this.logger.warn(`Receiver ID must be provided to accept a request.`)
      throw new MissingReceiverId()
    }

    if (!senderId) {
      this.logger.warn(`Sender ID must be provided to accept a request.`)
      throw new MissingSenderId()
    }

    if (senderId === receiverId) {
      this.logger.warn(`Sender and receiver cannot have the same id.`)
      throw new SameIdsError()
    }

    this.checkExistingUser(senderId)
    this.checkExistingUser(receiverId)

    // const sender: User = await this.usersRepository.findOne({
    //   where: { id: senderId }
    // })
    // if (!sender) {
    //   this.logger.warn(`Sender with ID : ${senderId} not found in database.`)
    //   throw new UserNotFound()
    // }

    // const receiver: User = await this.usersRepository.findOne({
    //   where: { id: receiverId }
    // })
    // if (!receiver) {
    //   this.logger.warn(
    //     `Receiver with ID : ${receiverId} not found in database.`
    //   )
    //   throw new UserNotFound()
    // }

    const friendshipRequest: Friendship =
      await this.friendshipRepository.findOne({
        where: {
          sender: { id: senderId },
          receiver: { id: receiverId },
          status: FriendshipStatus.PENDING
        }
      })
    if (!friendshipRequest) {
      this.logger.warn(
        `Pending friend request sent by : ${senderId} to : ${receiverId} not found.`
      )
      throw new FriendshipNotFound()
    }

    if (friendshipRequest.receiver.id !== receiverId) {
      this.logger.warn(
        `Only the receiver : ${friendshipRequest.receiver.id} can accept this friend request.`
      )
      throw new OnlyReceiverCanAcceptFriendRequest()
    }

    friendshipRequest.status = FriendshipStatus.ACCEPTED
    this.logger.verbose(
      `Friend request sent by : ${senderId} to : ${receiverId} accepted.`
    )

    // await this.usersRepository.save(receiver)
    // await this.usersRepository.save(sender)
    await this.friendshipRepository.save(friendshipRequest)

    return friendshipRequest
  }

  // ********* //
  // blockUser //
  // ********* //

  // todo (Lucas): check what is best between findOne and count (implies not saving the sender and receiver at then end)
  async blockUser(blockerId: string, toBlockId: string): Promise<Friendship> {
    if (!blockerId) {
      this.logger.warn(`Blocker ID must be provided to block a friendship`)
      throw new MissingBlockerId()
    }

    if (!toBlockId) {
      this.logger.warn(
        `User to block ID must be provided to block a friendship`
      )
      throw new MissingToBlockId()
    }

    if (blockerId === toBlockId) {
      this.logger.warn(`Users cannot block themselves`)
      throw new SameIdsError()
    }

    const blocker: User = await this.getExistingUser(blockerId)
    const toBlock: User = await this.getExistingUser(toBlockId)

    const existingFriendship: Friendship = await this.getFriendship(
      blockerId,
      toBlockId
    )

    // const existingFriendship = await this.friendshipRepository.findOne({
    //   where: [
    //     {
    //       sender: { id: blockerId },
    //       receiver: { id: toBlockId }
    //     },
    //     {
    //       sender: { id: toBlockId },
    //       receiver: { id: blockerId }
    //     }
    //   ]
    // })
    if (existingFriendship) {
      if (existingFriendship.status === FriendshipStatus.BLOCKED) {
        this.logger.warn(`Friendship status is already blocked.`)
        throw new FriendshipAlreadyBlocked()
      }

      existingFriendship.status = FriendshipStatus.BLOCKED
      this.logger.verbose(`Friendship status is now blocked.`)

      existingFriendship.blockerId = blockerId
      this.logger.verbose(`Blocker ID : ${blockerId} set in database.`)

      // await this.usersRepository.save(blocker)
      // await this.usersRepository.save(toBlock)
      await this.friendshipRepository.save(existingFriendship)

      this.logger.verbose(
        `${toBlockId} has been successfully blocked by ${blockerId}`
      )

      return existingFriendship
    } else {
      const friendship = this.friendshipRepository.create({
        blockerId: blockerId,
        status: FriendshipStatus.BLOCKED,
        sender: blocker,
        receiver: toBlock
      })

      await this.usersRepository.save(blocker)
      await this.friendshipRepository.save(friendship)

      this.logger.verbose(
        `${toBlockId} has been successfully blocked by ${blockerId}`
      )

      return friendship
    }
  }

  // ************ //
  // getBlockerId //
  // ************ //

  async getBlockerId(
    loggedUserId: string,
    observedUserId: string
  ): Promise<string> {
    if (!loggedUserId) {
      this.logger.warn(`Logged user ID is missing.`)
      throw new MissingLoggedUserId()
    }
    if (!observedUserId) {
      this.logger.warn(`Observed user ID is missing.`)
      throw new MissingObservedUserId()
    }

    const loggedUser = await this.usersRepository.findOne({
      where: { id: loggedUserId }
    })
    if (!loggedUser) {
      throw new UserNotFound()
    }

    const observedUser = await this.usersRepository.findOne({
      where: { id: observedUserId }
    })
    if (!observedUser) {
      throw new UserNotFound()
    }

    const friendship = await this.friendshipRepository.findOne({
      where: [
        {
          sender: { id: loggedUser.id },
          receiver: { id: observedUser.id }
        },
        {
          sender: { id: observedUser.id },
          receiver: { id: loggedUser.id }
        }
      ]
    })
    if (friendship && FriendshipStatus.BLOCKED) {
      this.logger.verbose(
        `The friendship between ${loggedUserId} and ${observedUserId} is blocked by ${friendship.blockerId}`
      )
      return friendship.blockerId
    }

    return null
  }

  // ************* //
  // getFriendList //
  // ************* //

  async getFriendList(userId: string): Promise<User[]> {
    if (!userId) {
      this.logger.warn(`User ID is missing.`)
      throw new MissingUserId()
    }

    const user = await this.usersRepository.findOne({
      where: { id: userId }
    })
    if (!user) {
      this.logger.warn(`User with ID : ${userId} not found in database.`)
      throw new UserNotFound()
    }

    const friendships = await this.friendshipRepository.find({
      where: [
        { sender: { id: userId }, status: FriendshipStatus.ACCEPTED },
        { receiver: { id: userId }, status: FriendshipStatus.ACCEPTED }
      ]
    })
    if (!friendships) {
      this.logger.warn(
        `No accepted friendships found in database for ${userId}.`
      )
      return []
    }

    const friendList = friendships.map((friendship) => {
      if (friendship.sender.id === userId) {
        return friendship.receiver
      } else {
        return friendship.sender
      }
    })

    this.logger.verbose(`Friend list of : ${userId} successfully retrieved.`)

    return friendList
  }

  // ***************** //
  // getFriendRequests //
  // ***************** //

  async getFriendRequests(userId: string): Promise<Friendship[]> {
    if (!userId) {
      this.logger.warn(`User ID is missing.`)
      throw new MissingUserId()
    }

    const user = await this.usersRepository.findOne({
      where: { id: userId }
    })
    if (!user) {
      this.logger.warn(`User with ID : ${userId} not found in database.`)
      throw new UserNotFound()
    }

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
  // rejectFriendRequest //
  // ******************* //

  async rejectFriendRequest(
    receiverId: string,
    senderId: string
  ): Promise<Friendship> {
    if (!receiverId) {
      this.logger.warn(`Receiver ID must be provided to reject a request.`)
      throw new MissingReceiverId()
    }

    if (!senderId) {
      this.logger.warn(`Sender ID must be provided to reject a request.`)
      throw new MissingSenderId()
    }

    if (receiverId === senderId) {
      this.logger.warn(`Sender and receiver cannot have the same id.`)
      throw new SameIdsError()
    }

    const friendshipRequest = await this.friendshipRepository.findOne({
      where: {
        sender: { id: senderId },
        receiver: { id: receiverId },
        status: FriendshipStatus.PENDING
      }
    })
    if (!friendshipRequest) {
      this.logger.warn(
        `Pending friend request sent by ${senderId} to ${receiverId} not found in database.`
      )
      throw new FriendshipNotFound()
    }

    if (friendshipRequest.receiver.id !== receiverId) {
      this.logger.warn(
        `Only the receiver : ${friendshipRequest.receiver.id} can reject this friend request`
      )
      throw new OnlyReceiverCanRejectFriendRequest()
    }

    friendshipRequest.status = FriendshipStatus.REJECTED
    this.logger.verbose(
      `Friend request sent by ${senderId} to ${receiverId} successfuly rejected by ${receiverId}.`
    )

    await this.friendshipRepository.save(friendshipRequest)

    return friendshipRequest
  }

  // ***************** //
  // sendFriendRequest //
  // ***************** //

  async sendFriendRequest(
    senderId: string,
    receiverId: string
  ): Promise<Friendship> {
    if (!receiverId) {
      this.logger.warn(`Receiver ID must be provided to reject a request.`)
      throw new MissingReceiverId()
    }

    if (!senderId) {
      this.logger.warn(`Sender ID must be provided to reject a request.`)
      throw new MissingSenderId()
    }

    if (senderId === receiverId) {
      this.logger.warn(`Sender and receiver cannot have the same id.`)
      throw new BadRequestException(
        'Sender and receiver cannot have the same id.'
      )
    }

    const sender = await this.usersRepository.findOne({
      where: { id: senderId }
    })
    if (!sender) {
      this.logger.warn(`Sender with ID : ${senderId} not found in database.`)
      throw new UserNotFound()
    }

    const receiver = await this.usersRepository.findOne({
      where: { id: receiverId }
    })
    if (!receiver) {
      this.logger.warn(
        `Receiver with ID : ${receiverId} not found in database.`
      )
      throw new UserNotFound()
    }

    const existingFriendship = await this.getFriendship(senderId, receiverId)

    // const existingFriendship = await this.friendshipRepository.findOne({
    //   where: [
    //     {
    //       sender: { id: sender.id },
    //       receiver: { id: receiver.id }
    //     },
    //     {
    //       sender: { id: receiver.id },
    //       receiver: { id: sender.id }
    //     }
    //   ]
    // })
    if (existingFriendship) {
      if (existingFriendship.status === FriendshipStatus.PENDING) {
        this.logger.warn(`A pending friendship already exists in database.`)
        throw new FriendshipAlreadyPending()
      } else if (existingFriendship.status === FriendshipStatus.ACCEPTED) {
        this.logger.warn(`An accepted friendship already exists in database`)
        throw new FriendshipAlreadyAccepted()
      } else if (existingFriendship.status === FriendshipStatus.BLOCKED) {
        this.logger.warn(`A blocked friendship already exists in database`)
        throw new FriendshipBlocked()
      } else if (existingFriendship.status === FriendshipStatus.REJECTED) {
        existingFriendship.status = FriendshipStatus.PENDING
        this.logger.verbose(`Friendship status is now pending.`)

        await this.friendshipRepository.save(existingFriendship)

        return existingFriendship
      }
    } else {
      const friendship = this.friendshipRepository.create({
        blockerId: null,
        status: FriendshipStatus.PENDING,
        sender,
        receiver
      })

      this.logger.verbose(`A new pending request has been created.`)

      await this.friendshipRepository.save(friendship)

      this.logger.verbose(
        `Friend request successfully sent by ${senderId} to ${receiverId}.`
      )

      return friendship
    }
  }

  // *********** //
  // unblockUser //
  // *********** //

  async unblockUser(
    unblockerId: string,
    toUnblockId: string
  ): Promise<Friendship> {
    if (!unblockerId) {
      this.logger.warn(`Unblocker ID is missing.`)
      throw new MissingUnblockerId()
    }

    if (!toUnblockId) {
      this.logger.warn(`User to unblock ID is missing.`)
      throw new MissingToUnblockId()
    }

    if (unblockerId === toUnblockId) {
      this.logger.warn(`Users cannot unblock themselves`)
      throw new SameIdsError()
    }

    const unblocker = await this.usersRepository.findOne({
      where: { id: unblockerId }
    })
    if (!unblocker) {
      this.logger.warn(`User with ID : ${unblockerId} not found in database.`)
      throw new UserNotFound()
    }

    const toUnblock = await this.usersRepository.findOne({
      where: { id: toUnblockId }
    })
    if (!toUnblock) {
      this.logger.warn(`User with ID : ${toUnblockId} not found in database.`)
      throw new UserNotFound()
    }

    const friendship = await this.friendshipRepository.findOne({
      where: [
        { sender: { id: unblockerId }, receiver: { id: toUnblockId } },
        { sender: { id: toUnblockId }, receiver: { id: unblockerId } }
      ]
    })
    if (!friendship) {
      this.logger.warn(`Friendship to unblock not found in database.`)
      throw new FriendshipNotFound()
    }

    if (friendship.status !== FriendshipStatus.BLOCKED) {
      this.logger.warn(`The friendship is not blocked.`)
      throw new FriendshipNotBlocked()
    }

    if (unblockerId !== friendship.blockerId) {
      this.logger.warn(
        `Only the ${friendship.blockerId} can unblock the friendship.`
      )
      throw new OnlyBlockerCanUnblock()
    }

    friendship.status = FriendshipStatus.ACCEPTED
    this.logger.verbose(`Friendship status is now accepted.`)

    friendship.blockerId = null
    this.logger.verbose(`The blocker id is re-set to null in the database.`)

    await this.friendshipRepository.save(friendship)

    this.logger.verbose(
      `${toUnblockId} has been successfully unblocked by ${unblockerId}`
    )

    return friendship
  }
}
