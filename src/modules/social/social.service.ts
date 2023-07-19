import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { User } from '@/modules/users/user.entity'

import { Friendship, FriendshipStatus } from './entities/friendship.entity'
import { UserNotFound } from '@/core/exceptions'
import {
  FriendRequestNotFound,
  OnlyRecieverCanAcceptFriendRequest,
  FriendRequestAlreadyBlocked,
  SameIdsError,
  FriendRequestNotBlocked,
  BlockerCannotUnblock
} from '@/core/exceptions/social'

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

  // ******************* //
  // acceptFriendRequest //
  // ******************* //

  async acceptFriendRequest(
    receiverId: string,
    senderId: string
  ): Promise<Friendship> {
    if (!receiverId || !senderId) {
      this.logger.warn(
        `A sender and a receiver must be provided to accept a friend request.`
      )
      throw new BadRequestException(
        'A sender and a receiver must be provided to accept a friend request.'
      )
    }

    if (senderId === receiverId) {
      this.logger.warn(`Sender and receiver cannot have the same id.`)
      throw new SameIdsError()
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

    const friendshipRequest = await this.friendshipRepository.findOne({
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
      throw new FriendRequestNotFound()
    }

    if (friendshipRequest.receiver.id !== receiverId) {
      this.logger.warn(
        `Only the receiver : ${friendshipRequest.receiver.id} can accept this friend request.`
      )
      throw new OnlyRecieverCanAcceptFriendRequest()
    }

    friendshipRequest.status = FriendshipStatus.ACCEPTED
    this.logger.verbose(
      `Friend request sent by : ${senderId} to : ${receiverId} accepted.`
    )

    await this.usersRepository.save(receiver)
    await this.usersRepository.save(sender)
    await this.friendshipRepository.save(friendshipRequest)

    return friendshipRequest
  }

  // ********* //
  // blockUser //
  // ********* //

  async blockUser(blockerId: string, toBlockId: string): Promise<Friendship> {
    if (!blockerId || !toBlockId) {
      this.logger.warn(
        `IDs of the blocker and user to block are both required.`
      )
      throw new BadRequestException(
        'IDs of the blocker and user to block are both required.'
      )
    }

    if (blockerId === toBlockId) {
      this.logger.warn(`Users cannot block themselves`)
      throw new SameIdsError()
    }

    const blocker = await this.usersRepository.findOne({
      where: { id: blockerId }
    })
    if (!blocker) {
      this.logger.warn(`Blocker with ID : ${blockerId} not found in database.`)
      throw new UserNotFound()
    }

    const toBlock = await this.usersRepository.findOne({
      where: { id: toBlockId }
    })
    if (!toBlock) {
      this.logger.warn(
        `User to block with ID : ${toBlockId} not found in database.`
      )
      throw new UserNotFound()
    }

    const existingFriendship = await this.friendshipRepository.findOne({
      where: [
        {
          sender: { id: blockerId },
          receiver: { id: toBlockId }
        },
        {
          sender: { id: toBlockId },
          receiver: { id: blockerId }
        }
      ]
    })
    if (existingFriendship) {
      if (existingFriendship.status === FriendshipStatus.BLOCKED) {
        this.logger.warn(`Friendship status is already blocked.`)
        throw new FriendRequestAlreadyBlocked()
      }

      existingFriendship.status = FriendshipStatus.BLOCKED
      this.logger.verbose(`Friendship status is now blocked.`)

      existingFriendship.blockerId = blockerId
      this.logger.verbose(
        `The blocker id : ${blockerId} is set in the database.`
      )

      await this.usersRepository.save(blocker)
      await this.usersRepository.save(toBlock)
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
    if (!loggedUserId || !observedUserId) {
      this.logger.warn(`IDs of the logged and observed user are both required.`)
      throw new BadRequestException(
        'IDs of the logged and observed user are both required.'
      )
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

    this.logger.verbose(
      `The friendship between ${loggedUserId} and ${observedUserId} is not blocked or does not exist. `
    )

    return null
  }

  // ************* //
  // getFriendList //
  // ************* //

  async getFriendList(userId: string): Promise<User[]> {
    if (!userId) {
      this.logger.warn(`ID of the user is required.`)
      throw new BadRequestException('ID of the user is required.')
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
      this.logger.warn(`ID of the user is required.`)
      throw new BadRequestException('ID of the user is required.')
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
    if (!receiverId || !senderId) {
      this.logger.warn(
        `A sender and a receiver must be provided to reject a friend request`
      )
      throw new BadRequestException(
        'A sender and a receiver must be provided to reject a friend request'
      )
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
      throw new FriendRequestNotFound()
    }

    if (friendshipRequest.receiver.id !== receiverId) {
      this.logger.warn(
        `Only the receiver : ${friendshipRequest.receiver.id} can reject this friend request`
      )
      throw new UnauthorizedException(
        `Only the receiver : ${friendshipRequest.receiver.id} can reject this friend request.`
      )
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
    if (!senderId || !receiverId) {
      this.logger.warn(
        `A sender and a receiver must be provided to send a friend request.`
      )
      throw new BadRequestException(
        'A sender and a receiver must be provided to send a friend request.'
      )
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
      throw new NotFoundException(
        `Sender with ID : ${senderId} not found in database.`
      )
    }

    const receiver = await this.usersRepository.findOne({
      where: { id: receiverId }
    })
    if (!receiver) {
      this.logger.warn(
        `Receiver with ID : ${receiverId} not found in database.`
      )
      throw new NotFoundException(
        `Receiver with ID : ${receiverId} not found in database.`
      )
    }

    const existingFriendship = await this.friendshipRepository.findOne({
      where: [
        {
          sender: { id: sender.id },
          receiver: { id: receiver.id }
        },
        {
          sender: { id: receiver.id },
          receiver: { id: sender.id }
        }
      ]
    })
    if (existingFriendship) {
      if (existingFriendship.status === FriendshipStatus.PENDING) {
        this.logger.warn(`A pending friendship already exists in database.`)
        throw new BadRequestException(
          'A pending friendship already exists in database.'
        )
      } else if (existingFriendship.status === FriendshipStatus.ACCEPTED) {
        this.logger.warn(`An accepted friendship already exists in database`)
        throw new BadRequestException(
          'An accepted friendship already exists in database'
        )
      } else if (existingFriendship.status === FriendshipStatus.BLOCKED) {
        this.logger.warn(`A blocked friendship already exists in database`)
        throw new BadRequestException(
          'A blocked friendship already exists in database'
        )
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
    if (!unblockerId || !toUnblockId) {
      this.logger.warn(
        `IDs of the unblocker and user to unblock are both required.`
      )
      throw new BadRequestException(
        'IDs of the unblocker and user to unblock are both required.'
      )
    }

    if (unblockerId === toUnblockId) {
      this.logger.warn(`Users cannot unblock themselves`)
      throw new BadRequestException('Users cannot unblock themselves')
    }

    const unblocker = await this.usersRepository.findOne({
      where: { id: unblockerId }
    })
    if (!unblocker) {
      this.logger.warn(`User with ID : ${unblockerId} not found in database.`)
      throw new NotFoundException(
        `User with ID : ${unblockerId} not found in database.`
      )
    }

    const toUnblock = await this.usersRepository.findOne({
      where: { id: toUnblockId }
    })
    if (!toUnblock) {
      this.logger.warn(`User with ID : ${toUnblockId} not found in database.`)
      throw new NotFoundException(`User with ID ${toUnblockId} not found.`)
    }

    const friendship = await this.friendshipRepository.findOne({
      where: [
        { sender: { id: unblockerId }, receiver: { id: toUnblockId } },
        { sender: { id: toUnblockId }, receiver: { id: unblockerId } }
      ]
    })
    if (!friendship) {
      this.logger.warn(`Friendship to unblock not found in database.`)
      throw new FriendRequestNotFound()
    }

    if (friendship.status !== FriendshipStatus.BLOCKED) {
      this.logger.warn(`The friendship is not blocked.`)
      throw new FriendRequestNotBlocked()
    }

    if (unblockerId !== friendship.blockerId) {
      this.logger.warn(
        `Only the ${friendship.blockerId} can unblock the friendship.`
      )
      throw new BlockerCannotUnblock()
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
