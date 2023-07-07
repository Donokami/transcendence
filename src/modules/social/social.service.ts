import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '@/modules/users/user.entity';

import { Friendship, FriendshipStatus } from './entities/friendship.entity';

@Injectable()
export class SocialService {
  // *********** //
  // CONSTRUCTOR //
  // *********** //

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Friendship)
    private friendshipRepository: Repository<Friendship>,
  ) {}

  // ******************* //
  // acceptFriendRequest //
  // ******************* //

  async acceptFriendRequest(
    receiverId: string,
    senderId: string,
  ): Promise<Friendship> {
    // Check if sender and receiver are the same
    if (senderId === receiverId) {
      throw new BadRequestException(
        'You cannot send a friend request to yourself.',
      );
    }
    // Check if the sender with senderId exists in database
    const sender = await this.usersRepository.findOne({
      where: { id: senderId },
    });
    if (!sender) {
      throw new NotFoundException(`Sender with id ${senderId} not found.`);
    }
    // Check if the receiver with receiverId exists in database
    const receiver = await this.usersRepository.findOne({
      where: { id: receiverId },
    });
    if (!receiver) {
      throw new NotFoundException(`Receiver with id ${receiverId} not found.`);
    }
    // Check if a friendship request send by sender to receiver exists in database
    const friendshipRequest = await this.friendshipRepository.findOne({
      where: {
        sender: { id: senderId },
        receiver: { id: receiverId },
        status: FriendshipStatus.PENDING,
      },
    });
    if (!friendshipRequest) {
      throw new NotFoundException(
        `Friendship request sent by ${senderId} not found.`,
      );
    }
    // Check if the friendship request is addressed to receiver
    if (friendshipRequest.receiver.id !== receiverId) {
      throw new UnauthorizedException(
        `${friendshipRequest.receiver.id} cannot accept a friend request addressed to ${receiverId}`,
      );
    }
    // Change the friendship request status to ACCEPTED
    friendshipRequest.status = FriendshipStatus.ACCEPTED;

    // Save changes in the database
    await this.usersRepository.save(receiver);
    await this.usersRepository.save(sender);
    await this.friendshipRepository.save(friendshipRequest);
    // Return
    return friendshipRequest;
  }

  // ********* //
  // blockUser //
  // ********* //

  async blockUser(blockerId: string, toBlockId: string): Promise<Friendship> {
    // Check if blockerId and toBlockId are the same
    if (blockerId === toBlockId) {
      throw new BadRequestException('You cannot block yourself.');
    }
    // Check if blocker with blockerId exists in database
    const blocker = await this.usersRepository.findOne({
      where: { id: blockerId },
    });
    if (!blocker) {
      throw new NotFoundException(`User with id ${blockerId} not found.`);
    }
    // Check if toBlock with toBlockId exists in database
    const toBlock = await this.usersRepository.findOne({
      where: { id: toBlockId },
    });
    if (!toBlock) {
      throw new NotFoundException(`User with id ${toBlockId} not found.`);
    }
    // Check if the friendship between blocker and toBlock exists in database
    const existingFriendship = await this.friendshipRepository.findOne({
      where: [
        {
          sender: { id: blockerId },
          receiver: { id: toBlockId },
        },
        {
          sender: { id: toBlockId },
          receiver: { id: blockerId },
        },
      ],
    });
    // If friendship exists
    if (existingFriendship) {
      // Check if friendship is already blocked
      if (existingFriendship.status === FriendshipStatus.BLOCKED) {
        throw new BadRequestException(
          'Friendship already exists and is blocked.',
        );
      }
      //  Change existingFriendship status to BLOCKED
      existingFriendship.status = FriendshipStatus.BLOCKED;
      // Set blockerId in existingFriendship to blockerId
      existingFriendship.blockerId = blockerId;
      // Save changes in the database and return
      await this.usersRepository.save(blocker);
      await this.usersRepository.save(toBlock);
      await this.friendshipRepository.save(existingFriendship);
      // Return
      return existingFriendship;
    }
    // Else (if friendship does not exists)
    else {
      // Create friendship
      const friendship = this.friendshipRepository.create({
        blockerId: blockerId,
        status: FriendshipStatus.BLOCKED,
        sender: blocker,
        receiver: toBlock,
      });

      // Save changes in the database
      await this.usersRepository.save(blocker);
      await this.friendshipRepository.save(friendship);
      // Return
      return friendship;
    }
  }

  // ************ //
  // getBlockerId //
  // ************ //

  async getBlockerId(
    loggedUserId: string,
    observedUserId: string,
  ): Promise<string> {
    // Check if user with loggedUserId exists in database
    const loggedUser = await this.usersRepository.findOne({
      where: { id: loggedUserId },
    });
    if (!loggedUser) {
      throw new NotFoundException(`User with id ${loggedUserId} not found.`);
    }
    // Check if user with observedUserId exists in database
    const observedUser = await this.usersRepository.findOne({
      where: { id: observedUserId },
    });
    if (!observedUser) {
      throw new NotFoundException(`User with id ${observedUserId} not found.`);
    }
    // Check if the friendship between loggedUser and observedUser
    const friendship = await this.friendshipRepository.findOne({
      where: [
        {
          sender: { id: loggedUser.id },
          receiver: { id: observedUser.id },
          status: FriendshipStatus.BLOCKED,
        },
        {
          sender: { id: observedUser.id },
          receiver: { id: loggedUser.id },
          status: FriendshipStatus.BLOCKED,
        },
      ],
    });
    if (!friendship) {
      return null;
    }
    return friendship.blockerId;
  }

  // ************* //
  // getFriendList //
  // ************* //

  async getFriendList(userId: string): Promise<User[]> {
    // Check if user with userId exists in database
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found.`);
    }
    // Get all friendships of the user where status is ACCEPTED
    const friendships = await this.friendshipRepository.find({
      where: [
        { sender: { id: userId }, status: FriendshipStatus.ACCEPTED },
        { receiver: { id: userId }, status: FriendshipStatus.ACCEPTED },
      ],
    });
    if (!friendships) {
      throw new NotFoundException(`No friendships found for ${userId}.`);
    }
    // Map the friendships (array of Friendship) to a friendList (array of User)
    const friendList = friendships.map((friendship) => {
      if (friendship.sender.id === userId) {
        return friendship.receiver;
      } else {
        return friendship.sender;
      }
    });
    // Return
    return friendList;
  }

  // ***************** //
  // getFriendRequests //
  // ***************** //

  async getFriendRequests(userId: string): Promise<Friendship[]> {
    // Check if user with userId exists in database
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found.`);
    }
    // Get all friendships of the user where status is PENDING
    const friendRequests = await this.friendshipRepository.find({
      where: {
        receiver: { id: userId },
        status: FriendshipStatus.PENDING,
      },
    });
    // Return
    return friendRequests;
  }

  // ******************* //
  // rejectFriendRequest //
  // ******************* //

  async rejectFriendRequest(
    receiverId: string,
    senderId: string,
  ): Promise<Friendship> {
    // Check if senderId and receiverId are the same
    if (receiverId === senderId) {
      throw new BadRequestException(
        'You cannot reject a friend request to yourself.',
      );
    }
    // Check if a friendship request sent by senderId to receiverId exists in database
    const friendshipRequest = await this.friendshipRepository.findOne({
      where: {
        sender: { id: senderId },
        receiver: { id: receiverId },
        status: FriendshipStatus.PENDING,
      },
    });
    if (!friendshipRequest) {
      throw new NotFoundException(
        `Friendship request sent by ${senderId} to ${receiverId} not found.`,
      );
    }
    // Check if the friendship request is addressed to receiver
    if (friendshipRequest.receiver.id !== receiverId) {
      throw new UnauthorizedException(
        `${friendshipRequest.receiver.id} cannot reject a friend request addressed to ${receiverId}`,
      );
    }
    // Change the friendship request status to REJECTED
    friendshipRequest.status = FriendshipStatus.REJECTED;
    // Save changes in the database
    await this.friendshipRepository.save(friendshipRequest);
    // Return
    return friendshipRequest;
  }

  // ***************** //
  // sendFriendRequest //
  // ***************** //

  async sendFriendRequest(
    senderId: string,
    receiverId: string,
  ): Promise<Friendship> {
    // Check if senderId and receiverId are the same
    if (senderId === receiverId) {
      throw new BadRequestException(
        'You cannot send a friend request to yourself.',
      );
    }
    // Check if a user with senderId exists in database
    const sender = await this.usersRepository.findOne({
      where: { id: senderId },
    });
    if (!sender) {
      throw new NotFoundException(`Sender with id ${senderId} not found.`);
    }
    // Check if a user with receiverId exists in database
    const receiver = await this.usersRepository.findOne({
      where: { id: receiverId },
    });
    if (!receiver) {
      throw new NotFoundException(`Receiver with id ${receiverId} not found.`);
    }
    // Check if a friendship already exists between sender and receiver in database
    const existingFriendship = await this.friendshipRepository.findOne({
      where: [
        {
          sender: { id: sender.id },
          receiver: { id: receiver.id },
        },
        {
          sender: { id: receiver.id },
          receiver: { id: sender.id },
        },
      ],
    });
    // If friendship already exists, check status and handle accordingly
    if (existingFriendship) {
      if (existingFriendship.status === FriendshipStatus.PENDING) {
        throw new BadRequestException(
          'Friendship already exists and is pending.',
        );
      } else if (existingFriendship.status === FriendshipStatus.ACCEPTED) {
        throw new BadRequestException(
          'Friendship already exists and is accepted',
        );
      } else if (existingFriendship.status === FriendshipStatus.BLOCKED) {
        throw new BadRequestException(
          'Friendship already exists and is blocked',
        );
      } else if (existingFriendship.status === FriendshipStatus.REJECTED) {
        existingFriendship.status = FriendshipStatus.PENDING;
        // Save changes in the database
        await this.friendshipRepository.save(existingFriendship);
        // Return
        return existingFriendship;
      }
    }
    // Else (if friendship does not exist, create it)
    else {
      const friendship = this.friendshipRepository.create({
        blockerId: null,
        status: FriendshipStatus.PENDING,
        sender: sender,
        receiver: receiver,
      });
      // Save changes in the database
      await this.friendshipRepository.save(friendship);
      // Return
      return friendship;
    }
  }

  // *********** //
  // unblockUser //
  // *********** //

  async unblockUser(
    unblockerId: string,
    toUnblockId: string,
  ): Promise<Friendship> {
    if (!unblockerId || !toUnblockId) {
      throw new BadRequestException(
        'You must provide both unblockerId and toUnblockId.',
      );
    }
    // Check if unblockerId and toUnblockId are the same
    if (unblockerId === toUnblockId) {
      throw new BadRequestException('You cannot unblock yourself.');
    }
    // Check if user with unblockerId exists in database
    const unblocker = await this.usersRepository.findOne({
      where: { id: unblockerId },
    });
    if (!unblocker) {
      throw new NotFoundException(`User with id ${unblockerId} not found.`);
    }
    // Check if user with toUnblockId exists in database
    const toUnblock = await this.usersRepository.findOne({
      where: { id: toUnblockId },
    });
    if (!toUnblock) {
      throw new NotFoundException(`User with id ${toUnblockId} not found.`);
    }
    // Check if a friendship between unblocker and toUnblock exists in database
    const friendship = await this.friendshipRepository.findOne({
      where: [
        { sender: { id: unblockerId }, receiver: { id: toUnblockId } },
        { sender: { id: toUnblockId }, receiver: { id: unblockerId } },
      ],
    });
    if (!friendship) {
      throw new UnauthorizedException(
        `Cannot unblock a user you have no relationship with.`,
      );
    }
    // Check if the friendship is blocked and if the current unblocker was the initial blocker
    if (
      friendship.status !== FriendshipStatus.BLOCKED ||
      unblockerId !== friendship.blockerId
    ) {
      throw new UnauthorizedException(
        `User with id ${toUnblockId} is not blocked by ${unblockerId}.`,
      );
    }
    // Change the friendship status to ACCEPTED
    friendship.status = FriendshipStatus.ACCEPTED;
    // Set blockerId to null
    friendship.blockerId = null;
    // Save changes in the database
    await this.friendshipRepository.save(friendship);
    // Return
    return friendship;
  }
}
