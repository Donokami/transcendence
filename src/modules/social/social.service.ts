import {
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
    const sender = await this.usersRepository.findOne({
      where: { id: senderId },
    });
    const receiver = await this.usersRepository.findOne({
      where: { id: senderId },
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
      throw new Error('Friendship request already sent.');
    }

    const friendship = this.friendshipRepository.create({
      userA: sender,
      userB: receiver,
      status: FriendshipStatus.PENDING,
      inActionUserId: senderId,
    });

    await this.friendshipRepository.save(friendship);

    return friendship;
  }

  // ******************* //
  // acceptFriendRequest //
  // ******************* //

  async acceptFriendRequest(
    userId: string,
    requestId: string,
  ): Promise<Friendship> {
    const friendshipRequest = await this.friendshipRepository.findOne({
      where: { id: requestId },
    });

    if (!friendshipRequest) {
      throw new NotFoundException(
        `Friendship request with id ${requestId} not found.`,
      );
    }

    if (friendshipRequest.userB.id !== userId) {
      throw new UnauthorizedException(
        'You cannot accept a friend request that is not addressed to you.',
      );
    }

    friendshipRequest.status = FriendshipStatus.ACCEPTED;

    await this.friendshipRepository.save(friendshipRequest);

    return friendshipRequest;
  }

  // ********* //
  // blockUser //
  // ********* //

  async blockUser(userId: string, userIdToBlock: string): Promise<Friendship> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });
    const userToBlock = await this.usersRepository.findOne({
      where: { id: userIdToBlock },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found.`);
    }
    if (!userToBlock) {
      throw new NotFoundException(`User with id ${userIdToBlock} not found.`);
    }

    const existingFriendship = await this.friendshipRepository.findOne({
      where: [
        {
          userA: { id: user.id },
          userB: { id: userToBlock.id },
        },
        {
          userA: { id: userToBlock.id },
          userB: { id: user.id },
        },
      ],
    });

    if (existingFriendship) {
      existingFriendship.status = FriendshipStatus.BLOCKED;
      existingFriendship.inActionUserId = userId;
      await this.friendshipRepository.save(existingFriendship);
      return existingFriendship;
    } else {
      const friendship = this.friendshipRepository.create({
        userA: user,
        userB: userToBlock,
        status: FriendshipStatus.BLOCKED,
        inActionUserId: userId,
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
    userIdToUnblock: string,
  ): Promise<Friendship> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });
    const userToUnblock = await this.usersRepository.findOne({
      where: { id: userIdToUnblock },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found.`);
    }
    if (!userToUnblock) {
      throw new NotFoundException(`User with id ${userIdToUnblock} not found.`);
    }

    const existingFriendship = await this.friendshipRepository.findOne({
      where: [
        { userA: { id: user.id }, userB: { id: userToUnblock.id } },
        { userA: { id: userToUnblock.id }, userB: { id: user.id } },
      ],
    });

    if (
      existingFriendship &&
      existingFriendship.status === FriendshipStatus.BLOCKED
    ) {
      existingFriendship.status = FriendshipStatus.ACCEPTED;
      existingFriendship.inActionUserId = userId;
      await this.friendshipRepository.save(existingFriendship);
      return existingFriendship;
    } else {
      throw new Error(
        `User with id ${userIdToUnblock} is not blocked and thus can't be unblocked.`,
      );
    }
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
