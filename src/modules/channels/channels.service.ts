import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { UsersService } from '@/modules/users/users.service';

import { Channel } from './entities/channel.entity';
import { Message } from './entities/message.entity';

import { type AddMessageDto } from '@/modules/chat/dtos/add-message.dto';
import { type BanUserDto } from '@/modules/chat/dtos/ban-user.dto';
import { type CreateChannelDto } from './dtos/create-channel.dto';
import { type UpdateChannelDto } from './dtos/update-channel.dto';

@Injectable()
export class ChannelsService {
  constructor(
    @InjectRepository(Channel)
    private readonly channelRepository: Repository<Channel>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly userService: UsersService,
  ) {}

  async findOne(id: string) {
    const channel = await this.channelRepository.findOneBy({ id });

    if (!channel) {
      throw new NotFoundException(`There is no channel under id ${id}`);
    }

    return channel;
  }

  async findAll() {
    const channels = await this.channelRepository.find({
      relations: ['messages'],
    });

    if (!channels) {
      throw new NotFoundException('No channels found');
    }

    return channels;
  }

  async findOneWithRelations(id: string) {
    const channel = await this.channelRepository.findOneBy({ id });

    if (!channel) {
      throw new NotFoundException(`There is no channel under id ${id}`);
    }

    return channel;
  }

  async create(createChannelDto: CreateChannelDto) {
    const newChannel = this.channelRepository.create({
      ...createChannelDto,
    });

    const channel = await this.channelRepository.save(newChannel);

    return channel;
  }

  async update(id: string, updateChannelDto: UpdateChannelDto) {
    const channel = await this.channelRepository.preload({
      id,
      ...updateChannelDto,
    });

    if (!channel) {
      throw new NotFoundException(`There is no channel under id ${id}`);
    }

    return await this.channelRepository.save(channel);
  }

  async remove(id: string) {
    const channel = await this.findOne(id);

    return await this.channelRepository.remove(channel);
  }

  async addMessage(addMessageDto: AddMessageDto) {
    const { messageBody, channelId, userId } = addMessageDto;

    const channel = await this.findOne(channelId);

    const user = await this.userService.findOneById(userId);

    const newMessage = this.messageRepository.create({
      messageBody,
      channel,
      user,
    });

    const message = await this.messageRepository.save(newMessage);

    return message;
  }

  async banUserFromChannel(banUserDto: BanUserDto) {
    const user = await this.userService.findOneById(banUserDto.userId);

    const channel = await this.findOne(banUserDto.channelId);

    await this.userService.updateUserChannel(banUserDto.userId, null);

    const bannedMembers = { ...channel.bannedMembers, ...user };
    const updatedChannel = await this.channelRepository.preload({
      id: banUserDto.channelId,
      bannedMembers,
    });

    return await this.channelRepository.save(updatedChannel);
  }
}
