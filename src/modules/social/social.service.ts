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
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Friendship)
    private readonly friendshipRepository: Repository<Friendship>,
  ) {}

  // ***************** //
  // sendFriendRequest //
  // ***************** //

  async sendFriendRequest(
    senderId: string,
    receiverId: string,
  ): Promise<Friendship> {
    // Check if sender and receiver are the same
    if (senderId === receiverId) {
      throw new BadRequestException(
        'You cannot send a friend request to yourself.',
      );
    }
    // Check if sender exists in database
    const sender = await this.usersRepository.findOne({
      where: { id: senderId },
    });
    if (!sender) {
      throw new NotFoundException(`Sender with id ${senderId} not found.`);
    }
    // Check if receiver exists in database
    const receiver = await this.usersRepository.findOne({
      where: { id: receiverId },
    });
    if (!receiver) {
      throw new NotFoundException(`Receiver with id ${receiverId} not found.`);
    }
    // Check if friendship already exists
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
    // If friendship already exists, check status and throw error if needed
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
        await this.friendshipRepository.save(existingFriendship);

        return existingFriendship;
      }
    }
    // If friendship does not exist, create it
    else {
      const friendship = this.friendshipRepository.create({
        blockerId: null,
        status: FriendshipStatus.PENDING,
        sender,
        receiver,
      });
      await this.friendshipRepository.save(friendship);

      return friendship;
    }
  }

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
    // Check if sender exists in database
    const sender = await this.usersRepository.findOne({
      where: { id: senderId },
    });
    if (!sender) {
      throw new NotFoundException(`Sender with id ${senderId} not found.`);
    }
    // Check if receiver exists in database
    const receiver = await this.usersRepository.findOne({
      where: { id: receiverId },
    });
    if (!receiver) {
      throw new NotFoundException(`Receiver with id ${receiverId} not found.`);
    }
    // Check if friendship request exists in database
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
    // Check if friendship request is well addressed to receiver
    if (friendshipRequest.receiver.id !== receiverId) {
      throw new UnauthorizedException(
        `${friendshipRequest.receiver.id} cannot accept a friend request addressed to ${receiverId}`,
      );
    }
    // Change friendship request status to accepted
    friendshipRequest.status = FriendshipStatus.ACCEPTED;

    // Save changes in the database
    await this.usersRepository.save(receiver);
    await this.usersRepository.save(sender);
    await this.friendshipRepository.save(friendshipRequest);

    return friendshipRequest;
  }

  // ******************* //
  // rejectFriendRequest //
  // ******************* //

  async rejectFriendRequest(
    receiverId: string,
    senderId: string,
  ): Promise<Friendship> {
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

    if (friendshipRequest.receiver.id !== receiverId) {
      throw new UnauthorizedException(
        `${friendshipRequest.receiver.id} cannot reject a friend request addressed to ${receiverId}`,
      );
    }

    friendshipRequest.status = FriendshipStatus.REJECTED;
    await this.friendshipRepository.save(friendshipRequest);

    return friendshipRequest;
  }

  // ********* //
  // blockUser //
  // ********* //

  async blockUser(userId: string, userToBlockId: string): Promise<Friendship> {
    // Check if userId and userToBlockId are the same
    if (userId === userToBlockId) {
      throw new BadRequestException('You cannot block yourself.');
    }
    // Check if userId exists in database
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found.`);
    }
    // Check if userToBlockId exists in database
    const userToBlock = await this.usersRepository.findOne({
      where: { id: userToBlockId },
    });
    if (!userToBlock) {
      throw new NotFoundException(`User with id ${userToBlockId} not found.`);
    }
    // Check if friendship exists
    const existingFriendship = await this.friendshipRepository.findOne({
      where: [
        {
          sender: { id: userId },
          receiver: { id: userToBlockId },
        },
        {
          sender: { id: userToBlockId },
          receiver: { id: userId },
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
      //  Change friendship status to blocked
      existingFriendship.status = FriendshipStatus.BLOCKED;
      // Set blockerId to userId
      existingFriendship.blockerId = userId;

      // Save changes in the database
      await this.usersRepository.save(user);
      await this.usersRepository.save(userToBlock);
      await this.friendshipRepository.save(existingFriendship);

      return existingFriendship;
    }
    // If friendship does not exists
    else {
      // Create friendship
      const friendship = this.friendshipRepository.create({
        blockerId: userId,
        status: FriendshipStatus.BLOCKED,
        sender: user,
        receiver: userToBlock,
      });

      // Save changes in the database
      await this.usersRepository.save(user);
      await this.friendshipRepository.save(friendship);

      return friendship;
    }
  }

  // *********** //
  // unblockUser //
  // *********** //

  async unblockUser(
    userId: string,
    userToUnblockId: string,
  ): Promise<Friendship> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found.`);
    }

    const userToUnblock = await this.usersRepository.findOne({
      where: { id: userToUnblockId },
    });
    if (!userToUnblock) {
      throw new NotFoundException(`User with id ${userToUnblockId} not found.`);
    }

    const existingFriendship = await this.friendshipRepository.findOne({
      where: [
        { sender: { id: user.id }, receiver: { id: userToUnblock.id } },
        { sender: { id: userToUnblock.id }, receiver: { id: user.id } },
      ],
    });
    if (!existingFriendship) {
      throw new UnauthorizedException(
        'Cannot unblock a user you have no relationship with.',
      );
    }

    if (
      existingFriendship.blockerId !== userId ||
      existingFriendship.status !== FriendshipStatus.BLOCKED
    ) {
      throw new UnauthorizedException(
        `User with id ${userToUnblockId} is not blocked by ${userId}.`,
      );
    }

    existingFriendship.status = FriendshipStatus.ACCEPTED;

    await this.friendshipRepository.save(existingFriendship);

    return existingFriendship;
  }

  // ***************** //
  // getFriendRequests //
  // ***************** //

  async getFriendRequests(userId: string): Promise<Friendship[]> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found.`);
    }

    const friendRequests = await this.friendshipRepository.find({
      where: {
        receiver: { id: userId },
        status: FriendshipStatus.PENDING,
      },
      relations: ['sender', 'receiver'],
    });

    return friendRequests;
  }

  // ************* //
  // getFriendList //
  // ************* //

  async getFriendList(userId: string): Promise<User[]> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found.`);
    }

    const friendships = await this.friendshipRepository.find({
      where: [
        { sender: { id: userId }, status: FriendshipStatus.ACCEPTED },
        { receiver: { id: userId }, status: FriendshipStatus.ACCEPTED },
      ],
      relations: ['sender', 'receiver'],
    });
    if (!friendships) {
      throw new NotFoundException(`No friendships found for ${userId}.`);
    }

    const friendList = friendships.map((friendship) => {
      if (friendship.sender.id === userId) {
        return friendship.receiver;
      } else {
        return friendship.sender;
      }
    });

    console.log(friendList);

    return friendList;
  }

  // ************** //
  // getBlockedList //
  // ************** //

  async getBlockedList(userId: string): Promise<User[]> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found.`);
    }

    const friendships = await this.friendshipRepository.find({
      where: [
        { sender: { id: userId }, status: FriendshipStatus.BLOCKED },
        { receiver: { id: userId }, status: FriendshipStatus.BLOCKED },
      ],
      relations: ['sender', 'receiver'],
    });
    if (!friendships) {
      throw new NotFoundException(`No friendships found for ${userId}.`);
    }

    const blockedList = friendships.map((friendship) => {
      if (friendship.sender.id === userId) {
        return friendship.receiver;
      } else {
        return friendship.sender;
      }
    });

    console.log(blockedList);

    return blockedList;
  }
}
