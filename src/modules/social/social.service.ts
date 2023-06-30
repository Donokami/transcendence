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
      userA: sender,
      userB: receiver,
      status: FriendshipStatus.PENDING,
      receiverId: receiverId,
      senderId: senderId,
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
      existingFriendship.receiverId = userId;
      await this.friendshipRepository.save(existingFriendship);
      return existingFriendship;
    } else {
      const friendship = this.friendshipRepository.create({
        userA: user,
        userB: userToBlock,
        status: FriendshipStatus.BLOCKED,
        receiverId: userId,
        senderId: userIdToBlock,
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
      existingFriendship.receiverId = userId;
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
