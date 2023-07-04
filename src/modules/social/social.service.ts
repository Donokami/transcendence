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
          userA: { id: sender.id },
          userB: { id: receiver.id },
        },
        {
          userA: { id: receiver.id },
          userB: { id: sender.id },
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
        receiverId: receiver.id,
        senderId: sender.id,
        status: FriendshipStatus.PENDING,
        userA: sender,
        userB: receiver,
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
    // Check if friendship request is well addressed to receiver
    if (friendshipRequest.receiverId !== receiverId) {
      throw new UnauthorizedException(
        `${friendshipRequest.receiverId} cannot accept a friend request addressed to ${receiverId}`,
      );
    }
    // Change friendship request status to accepted
    friendshipRequest.status = FriendshipStatus.ACCEPTED;
    // Create friends array for receiver and sender if it does not exist
    if (!receiver.friends) {
      receiver.friends = [];
    }
    if (!sender.friends) {
      sender.friends = [];
    }
    // Add sender to receiver friends array and receiver to sender friends array
    receiver.friends.push(sender);
    sender.friends.push(receiver);
    // Increment nFriends for receiver and sender
    receiver.nFriends = receiver.nFriends + 1;
    sender.nFriends = sender.nFriends + 1;
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
        userA: { id: senderId },
        userB: { id: receiverId },
        status: FriendshipStatus.PENDING,
      },
    });
    if (!friendshipRequest) {
      throw new NotFoundException(
        `Friendship request sent by ${senderId} to ${receiverId} not found.`,
      );
    }

    if (friendshipRequest.receiverId !== receiverId) {
      throw new UnauthorizedException(
        `${friendshipRequest.receiverId} cannot reject a friend request addressed to ${receiverId}`,
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
          userA: { id: userId },
          userB: { id: userToBlockId },
        },
        {
          userA: { id: userToBlockId },
          userB: { id: userId },
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
      // CHECK FRIENDS ARRAY HERE
      console.log(`[BEFORE BLOCK]`);
      console.log(
        `user friends : ${user.friends
          .map((friend) => friend.username)
          .join(', ')}`,
      );
      console.log(
        `userToBlock friends : ${userToBlock.friends
          .map((friend) => friend.username)
          .join(', ')}`,
      );
      // Remove userToBlockId from user friends array
      const userToBlockIndex = user.friends.indexOf(userToBlock, 0);
      if (userToBlockIndex > -1) {
        user.friends.splice(userToBlockIndex, 1);
      }
      // Remove userId from userToBlock friends array
      const userIndex = userToBlock.friends.indexOf(user, 0);
      if (userIndex > -1) {
        userToBlock.friends.splice(userIndex, 1);
      }
      // Create blockedUser array if it does not exist
      if (!user.blockedUser) {
        user.blockedUser = [];
      }
      // Add userToBlock to user blockedUser array
      user.blockedUser.push(userToBlock);
      // Save changes in the database
      await this.usersRepository.save(user);
      await this.usersRepository.save(userToBlock);
      await this.friendshipRepository.save(existingFriendship);
      // CHECK FRIENDS ARRAY HERE
      console.log(`[AFTER BLOCK]`);
      console.log(
        `user friends : ${user.friends
          .map((friend) => friend.username)
          .join(', ')}`,
      );
      console.log(
        `userToBlock friends : ${userToBlock.friends
          .map((friend) => friend.username)
          .join(', ')}`,
      );

      return existingFriendship;
    }
    // If friendship does not exists
    else {
      // Create friendship
      const friendship = this.friendshipRepository.create({
        blockerId: userId,
        receiverId: userToBlockId,
        senderId: userId,
        status: FriendshipStatus.BLOCKED,
        userA: user,
        userB: userToBlock,
      });
      // Create blockedUser array if it does not exist
      if (!user.blockedUser) {
        user.blockedUser = [];
      }
      // Add userToBlock to user blockedUser array
      user.blockedUser.push(userToBlock);
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
        { userA: { id: user.id }, userB: { id: userToUnblock.id } },
        { userA: { id: userToUnblock.id }, userB: { id: user.id } },
      ],
    });
    if (!existingFriendship) {
      throw new UnauthorizedException(
        `Cannot unblock a user you have no relationship with.`,
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
        userB: { id: userId },
        status: FriendshipStatus.PENDING,
      },
      relations: ['userA', 'userB'],
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
        { userA: { id: userId }, status: FriendshipStatus.ACCEPTED },
        { userB: { id: userId }, status: FriendshipStatus.ACCEPTED },
      ],
    });
    if (!friendships) {
      throw new NotFoundException(`No friendships found for ${userId}.`);
    }

    const friends = await Promise.all(
      friendships.map(async (friendship) => {
        if (friendship.senderId === userId) {
          return await this.usersRepository.findOne({
            where: { id: friendship.receiverId },
          });
        } else {
          return await this.usersRepository.findOne({
            where: { id: friendship.senderId },
          });
        }
      }),
    );

    console.log(friends);

    return friends;
  }
}
