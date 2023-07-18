import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { type Channel } from '@/modules/channels/entities/channel.entity';
import { type UserDetails } from '@/core/types/user-details';
import {
  Friendship,
  FriendshipStatus,
} from '@/modules/social/entities/friendship.entity';

import { randomUUID } from 'crypto';
import * as path from 'path';
import * as fs from 'fs';

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

  // *********** //
  // createOauth //
  // *********** //

  async createOauth(details: UserDetails) {
    const user = this.userRepository.create(details);
    return await this.userRepository.save(user);
  }

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

  // ************** //
  // findOneByEmail //
  // ************** //

  async findOneByEmail(email: string) {
    if (!email) {
      return null;
    }
    return await this.userRepository.find({ where: { email } });
  }

  // ****** //
  // remove //
  // ****** //

  async remove(id: string): Promise<User> {
    const user = await this.findOneById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return await this.userRepository.remove(user);
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
    return await this.userRepository.save(user);
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
      throw new ForbiddenException('You have been banned from this channel');
    }

    return await this.userRepository.save(user);
  }

  // ******** //
  // SaveFile //
  // ******** //

  async saveFile(file: Express.Multer.File): Promise<string> {
    const filename = randomUUID() + path.extname(file.originalname);
    const filePath = './uploads/' + filename;
    await fs.promises.writeFile(filePath, file.buffer);

    return filePath;
  }

  // ********** //
  // DeleteFile //
  // ********** //

  async deleteFile(filePath: string) {
    try {
      await fs.promises.unlink(filePath);
    } catch (error) {
      throw new BadRequestException('Invalid file path');
    }

    return;
  }
}
