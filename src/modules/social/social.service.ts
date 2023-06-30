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
    private usersRepository: Repository<User>,
    @InjectRepository(Friendship)
    private friendshipRepository: Repository<Friendship>,
  ) {}

  // ***************** //
  // sendFriendRequest //
  // ***************** //

  async sendFriendRequest(
    senderId: string,
    receiverId: string,
  ): Promise<Friendship> {
    if (senderId === receiverId) {
      throw new BadRequestException(
        'You cannot send a friend request to yourself.',
      );
    }

    const sender = await this.usersRepository.findOne({
      where: { id: senderId },
    });
    const receiver = await this.usersRepository.findOne({
      where: { id: receiverId },
    });

    if (!sender) {
      throw new NotFoundException(`User with id ${senderId} not found.`);
    }
    if (!receiver) {
      throw new NotFoundException(`User with id ${receiverId} not found.`);
    }

    const existingFriendship = await this.friendshipRepository.findOne({
      where: {
        userA: { id: sender.id },
        userB: { id: receiver.id },
      },
    });
    if (existingFriendship) {
      throw new BadRequestException('Friendship request already sent.');
    }

    const friendship = this.friendshipRepository.create({
      blockerId: null,
      receiverId: receiver.id,
      senderId: sender.id,
      status: FriendshipStatus.PENDING,
      userA: sender,
      userB: receiver,
    });

    await this.friendshipRepository.save(friendship);

    return friendship;
  }

  // ******************* //
  // acceptFriendRequest //
  // ******************* //

  async acceptFriendRequest(
    receiverId: string,
    senderId: string,
  ): Promise<Friendship> {
    const sender = await this.usersRepository.findOne({
      where: { id: senderId },
    });
    if (!sender) {
      throw new NotFoundException(`Sender not found.`);
    }

    const receiver = await this.usersRepository.findOne({
      where: { id: receiverId },
    });
    if (!receiver) {
      throw new NotFoundException(`Receiver not found.`);
    }

    const friendshipRequest = await this.friendshipRepository.findOne({
      where: {
        userA: { id: senderId },
        userB: { id: receiverId },
        status: FriendshipStatus.PENDING,
      },
    });
    if (!friendshipRequest) {
      throw new NotFoundException(
        `Friendship request sent by ${senderId} not found.`,
      );
    }

    if (friendshipRequest.receiverId !== receiverId) {
      throw new UnauthorizedException(
        'You cannot accept a friend request that is not addressed to you.',
      );
    }

    friendshipRequest.status = FriendshipStatus.ACCEPTED;

    if (!receiver.friends) {
      receiver.friends = [];
    }
    receiver.friends.push(sender);
    receiver.nFriends = receiver.nFriends + 1;

    if (!sender.friends) {
      sender.friends = [];
    }
    sender.friends.push(receiver);
    sender.nFriends = sender.nFriends + 1;

    await this.friendshipRepository.save(friendshipRequest);
    await this.usersRepository.save(sender);
    await this.usersRepository.save(receiver);

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
        userA: { id: senderId },
        userB: { id: receiverId },
        status: FriendshipStatus.PENDING,
      },
    });

    if (!friendshipRequest) {
      throw new NotFoundException(
        `Friendship request sent by ${senderId} not found.`,
      );
    }

    if (friendshipRequest.receiverId !== receiverId) {
      throw new Error(
        'You cannot reject a friend request that is not addressed to you.',
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
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found.`);
    }

    const userToBlock = await this.usersRepository.findOne({
      where: { id: userToBlockId },
    });
    if (!userToBlock) {
      throw new NotFoundException(`User with id ${userToBlockId} not found.`);
    }

    const existingFriendship = await this.friendshipRepository.findOne({
      where: [
        {
          userA: { id: userId },
          userB: { id: userToBlockId },
        },
        {
          userA: { id: userToBlockId },
          userB: { id: userId },
        },
      ],
    });

    if (existingFriendship) {
      existingFriendship.status = FriendshipStatus.BLOCKED;

      existingFriendship.blockerId = userId;

      const userToBlockIndex = user.friends.indexOf(userToBlock, 0);
      if (userToBlockIndex > -1) {
        user.friends.splice(userToBlockIndex, 1);
      }

      const userIndex = userToBlock.friends.indexOf(user, 0);
      if (userIndex > -1) {
        userToBlock.friends.splice(userIndex, 1);
      }

      await this.friendshipRepository.save(existingFriendship);
      await this.usersRepository.save(user);
      await this.usersRepository.save(userToBlock);

      return existingFriendship;
    } else {
      const friendship = this.friendshipRepository.create({
        blockerId: userId,
        receiverId: userToBlockId,
        senderId: userId,
        status: FriendshipStatus.BLOCKED,
        userA: user,
        userB: userToBlock,
      });

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
        { userA: { id: user.id }, userB: { id: userToUnblock.id } },
        { userA: { id: userToUnblock.id }, userB: { id: user.id } },
      ],
    });

    if (!existingFriendship) {
      throw new Error(`Cannot unblock a user you have no relationship with.`);
    }

    if (
      existingFriendship.blockerId !== userId ||
      existingFriendship.status !== FriendshipStatus.BLOCKED
    ) {
      throw new Error(`User with id ${userToUnblockId} is not blocked.`);
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
        userB: { id: userId },
        status: FriendshipStatus.PENDING,
      },
      relations: ['userA', 'userB'],
    });

    return friendRequests;
  }

  // ********** //
  // getFriends //
  // ********** //

  async getFriends(userId: string): Promise<User[]> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found.`);
    }

    const friendships = await this.friendshipRepository.find({
      where: [
        { userA: { id: userId }, status: FriendshipStatus.ACCEPTED },
        { userB: { id: userId }, status: FriendshipStatus.ACCEPTED },
      ],
    });

    const friends = friendships.map((friendship) =>
      friendship.userA.id === userId ? friendship.userB : friendship.userA,
    );

    return friends;
  }
}
