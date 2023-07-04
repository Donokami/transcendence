import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { Channel } from '@/modules/channels/entities/channel.entity';
import { UserDetails } from '@/modules/auth/utils/types';
import {
  Friendship,
  FriendshipStatus,
} from '@/modules/social/entities/friendship.entity';

import { User } from './user.entity';
import { UserDto } from './dtos/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Friendship)
    private friendshipRepository: Repository<Friendship>,
  ) {}

  // *********** //
  // createOauth //
  // *********** //

  createOauth(details: UserDetails) {
    const user = this.userRepository.create(details);
    return this.userRepository.save(user);
  }

  // ****** //
  // create //
  // ****** //

  create(email: string, password: string, username: string): Promise<User> {
    const user = this.userRepository.create({ email, password, username });
    return this.userRepository.save(user);
  }

  // ******* //
  // findAll //
  // ******* //
  async findAll(): Promise<User[]> {
    const users = await this.userRepository.find();
    return users;
  }

  // *********** //
  // findOneById //
  // *********** //

  async findOneById(id: string): Promise<User> {
    if (!id) {
      return null;
    }
    const user = await this.userRepository.findOneBy({
      id,
    });
    if (user)
      user.nFriends = await this.friendshipRepository.count({
        where: [
          { sender: { id }, status: FriendshipStatus.ACCEPTED },
          { receiver: { id }, status: FriendshipStatus.ACCEPTED },
        ],
      });
    return user;
  }

  // ************** //
  // findOneByEmail //
  // ************** //

  async findOneByEmail(email: string) {
    if (!email) {
      return null;
    }
    return this.userRepository.find({ where: { email } });
  }

  // ****** //
  // remove //
  // ****** //

  async remove(id: string): Promise<User> {
    const user = await this.findOneById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.userRepository.remove(user);
  }

  // ****** //
  // update //
  // ****** //

  async update(id: string, attrs: Partial<User>): Promise<User> {
    const user = await this.findOneById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    Object.assign(user, attrs);
    return this.userRepository.save(user);
  }

  // ***************** //
  // updateUserChannel //
  // ***************** //

  async updateUserChannel(id: string, channel: Channel): Promise<User> {
    const user = await this.userRepository.preload({
      id,
      channel,
    });

    if (!user) {
      throw new NotFoundException(`There is no user under id ${id}`);
    }

    const isBanned = user.bannedChannels?.find(
      (bannedChannel) => bannedChannel.id === channel?.id,
    );

    if (isBanned) {
      throw new ForbiddenException(`You have been banned from this channel`);
    }

    return this.userRepository.save(user);
  }
}
