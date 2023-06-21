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

  //  *****************  //
  //  sendFriendRequest  //
  //  *****************  //

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
      where: { userA: { id: sender.id }, userB: { id: receiver.id } },
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

  //  *******************  //
  //  acceptFriendRequest  //
  //  *******************  //

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
}
