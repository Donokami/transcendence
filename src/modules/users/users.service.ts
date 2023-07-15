import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { type Channel } from '@/modules/channels/entities/channel.entity';
import { type UserDetails } from '@/core/types/user-details';
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
    private readonly userRepository: Repository<User>,
    @InjectRepository(Friendship)
    private readonly friendshipRepository: Repository<Friendship>,
  ) {}

  // ****** //
  // LOGGER //
  // ****** //

  private logger: Logger = new Logger(UsersService.name);

  // ******************** //
  // FUNCTION DEFINITIONS //
  // ******************** //

  // ****** //
  // create //
  // ****** //

  async create(
    email: string,
    password: string,
    username: string,
  ): Promise<User> {
    const user = this.userRepository.create({ email, password, username });
    return await this.userRepository.save(user);
  }

  // *********** //
  // createOauth //
  // *********** //

  createOauth(details: UserDetails) {
    const user = this.userRepository.create(details);
    return this.userRepository.save(user);
  }

  // ******* //
  // findAll //
  // ******* //

  async findAll(): Promise<User[]> {
    const users = await this.userRepository.find();
    return users;
  }

  // **************** //
  // findAllWithStats //
  // **************** //

  async findAllWithStats(): Promise<User[]> {
    const users = await this.userRepository.find({
      select: [
        'id',
        'username',
        'rank',
        'gamesPlayed',
        'win',
        'loss',
        'winRate',
        'pointsScored',
        'pointsConceded',
        'pointsDifference',
      ],
    });
    return users;
  }

  // ********* //
  // findByIds //
  // ********* //

  async findByIds(userIds: string[]): Promise<User[]> {
    return this.userRepository.find({
      where: {
        id: In(userIds),
      },
    });
  }

  // ************** //
  // findOneByEmail //
  // ************** //

  async findOneByEmail(email: string): Promise<User> {
    if (!email) {
      return null;
    }

    const user = await this.userRepository.findOne({ where: { email } });

    return user;
  }

  // *************************** //
  // findOneByEmailWithAuthInfos //
  // *************************** //

  async findOneByEmailWithAuthInfos(email: string): Promise<User> {
    if (!email) {
      return null;
    }

    const user = await this.userRepository.findOne({
      where: { email },
      select: [
        'id',
        'username',
        'email',
        'password',
        'twoFactorSecret',
        'isTwoFactorEnabled',
      ],
    });

    return user;
  }

  // ************************ //
  // findOneByIdWithAuthInfos //
  // ************************ //

  async findOneByIdWithStats(id: string): Promise<User> {
    if (!id) {
      return null;
    }
    const user = await this.userRepository.findOne({
      where: { id },
      select: [
        'id',
        'username',
        'rank',
        'gamesPlayed',
        'win',
        'loss',
        'winRate',
        'pointsScored',
        'pointsConceded',
        'pointsDifference',
      ],
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
    if (user) {
      user.nFriends = await this.friendshipRepository.count({
        where: [
          { sender: { id }, status: FriendshipStatus.ACCEPTED },
          { receiver: { id }, status: FriendshipStatus.ACCEPTED },
        ],
      });
    }
    return user;
  }

  // ****** //
  // remove //
  // ****** //

  async remove(id: string): Promise<User> {
    const user = await this.findOneById(id);
    if (!user) {
      this.logger.warn(`User with ID : ${id} not found`);
      throw new NotFoundException(`User with ID : ${id} not found`);
    }
    return await this.userRepository.remove(user);
  }

  // ****** //
  // update //
  // ****** //

  async update(id: string, attrs: Partial<User>): Promise<User> {
    const user = await this.findOneById(id);
    if (!user) {
      this.logger.warn(`User with ID : ${id} not found`);
      throw new NotFoundException(`User with ID : ${id} not found`);
    }
    Object.assign(user, attrs);
    return await this.userRepository.save(user);
  }

  // ***************** //
  // updateUserChannel //
  // ***************** //

  async updateUserChannel(id: string, channel: Channel): Promise<User> {
    const user = await this.userRepository.preload({
      id,
      channels: [] as Channel[],
    });

    if (!user) {
      this.logger.warn(`User with ID : ${id} not found`);
      throw new NotFoundException(`User with ID : ${id} not found`);
    }

    const isBanned = user.bannedChannels?.find(
      (bannedChannel) => bannedChannel.id === channel?.id,
    );

    if (isBanned) {
      this.logger.warn(`User with ID : ${id} is banned from this channel`);
      throw new ForbiddenException(
        `User with ID : ${id} is banned from this channel`,
      );
    }

    return await this.userRepository.save(user);
  }
}
