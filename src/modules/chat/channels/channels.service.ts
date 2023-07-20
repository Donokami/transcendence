import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  forwardRef
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { UsersService } from '@/modules/users/users.service'

import { Channel } from '@/modules/chat/channels/entities/channel.entity'
import { Message } from '@/modules/chat/channels/entities/message.entity'
import { User } from '@/modules/users/user.entity'

import { CreateChannelDto } from './dtos/create-channel.dto'
import { MessageDto } from './dtos/message.dto'

import type { ServiceResponse } from '@/core/types/service-response'
import { response } from '@/core/utils'
import { ChannelError } from '@/core/constants/errors/channel-error'
import { ChatGateway } from '../chat.gateway'

@Injectable()
export class ChannelsService {
  constructor(
    @InjectRepository(Channel)
    private readonly channelsRepository: Repository<Channel>,
    @InjectRepository(Message)
    private readonly messagesRepository: Repository<Message>,
    private readonly userService: UsersService,
    @Inject(forwardRef(() => ChatGateway))
    private readonly chatGateway: ChatGateway
  ) {}

  // ****** //
  // LOGGER //
  // ****** //

  private logger = new Logger(ChannelsService.name)

  // ******************** //
  // FUNCTION DEFINITIONS //
  // ******************** //

  // *************** //
  // createDmChannel //
  // *************** //

  async createDmChannel(createChannelDto: CreateChannelDto): Promise<Channel> {
    const owner: User = await this.userService.findOneById(
      createChannelDto.ownerId
    )

    const members: User[] = await this.userService.findByIds(
      createChannelDto.membersIds
    )

    const newDmChannel = this.channelsRepository.create({
      isDm: true,
      owner: owner,
      members: members
    })

    return await this.channelsRepository.save(newDmChannel)
  }

  // ****************** //
  // createGroupChannel //
  // ****************** //

  async createGroupChannel(
    createChannelDto: CreateChannelDto
  ): Promise<Channel> {
    const owner: User = await this.userService.findOneById(
      createChannelDto.ownerId
    )

    const members: User[] = await this.userService.findByIds(
      createChannelDto.membersIds
    )

    members.forEach((member) => {
      member.profilePicture = ''
    })

    const newGroupChannel = this.channelsRepository.create({
      isDm: false,
      name: createChannelDto.name,
      owner: owner,
      members: members,
      passwordRequired: createChannelDto.passwordRequired,
      password: createChannelDto.password
    })

    return await this.channelsRepository.save(newGroupChannel)
  }

  // ******* //
  // findOne //
  // ******* //

  async findOne(id: string) {
    const channel = await this.channelsRepository.findOneBy({ id })

    if (!channel) {
      throw new NotFoundException(`There is no channel under id ${id}`)
    }

    return channel
  }

  // ********* //
  // getDmList //
  // ********* //

  async getDmList(userId: string): Promise<Channel[]> {
    if (!userId) {
      this.logger.warn(`ID of the user is required.`)
      throw new BadRequestException('ID of the user is required.')
    }

    const user = await this.userService.findOneById(userId)
    if (!user) {
      this.logger.warn(`User with ID : ${userId} not found in database.`)
      throw new NotFoundException(
        `User with ID : ${userId} not found in database.`
      )
    }

    const channelIds = await this.channelsRepository
      .createQueryBuilder('channel')
      .innerJoin('channel.members', 'member')
      .where('member.id = :userId', { userId })
      .select('channel.id')
      .getRawMany()

    const dm = await this.channelsRepository
      .createQueryBuilder('channel')
      .innerJoinAndSelect('channel.members', 'user')
      .where('channel.isDm = :isDm', { isDm: true })
      .andWhere('channel.id IN (:...channelIds)', {
        channelIds: channelIds.map((channel) => channel.channel_id)
      })
      .getMany()

    if (!dm.length) {
      this.logger.verbose(`No DMs found in database for ${userId}.`)
      return []
    }

    this.logger.verbose(`DMs list of : ${userId} successfully retrieved.`)

    return dm
  }

  // ******************** //
  // getGroupChannelsList //
  // ******************** //

  async getGroupChannelsList(userId: string): Promise<Channel[]> {
    if (!userId) {
      this.logger.warn(`ID of the user is required.`)
      throw new BadRequestException('ID of the user is required.')
    }

    const user = await this.userService.findOneById(userId)
    if (!user) {
      this.logger.warn(`User with ID : ${userId} not found in database.`)
      throw new NotFoundException(
        `User with ID : ${userId} not found in database.`
      )
    }

    const channelIds = await this.channelsRepository
      .createQueryBuilder('channel')
      .innerJoin('channel.members', 'member')
      .where('member.id = :userId', { userId })
      .select('channel.id')
      .getRawMany()

    const groupChannels = await this.channelsRepository
      .createQueryBuilder('channel')
      .innerJoinAndSelect('channel.members', 'user')
      .where('channel.isDm = :isDm', { isDm: false })
      .andWhere('channel.id IN (:...channelIds)', {
        channelIds: channelIds.map((channel) => channel.channel_id)
      })
      .getMany()

    if (!groupChannels.length) {
      this.logger.verbose(`No group channels found in database for ${userId}.`)
      return []
    }

    this.logger.verbose(`DMs list of : ${userId} successfully retrieved.`)

    return groupChannels
  }

  // *********** //
  // getMessages //
  // *********** //

  async getMessages(channelId: string): Promise<ServiceResponse<Message[]>> {
    if (!channelId) {
      this.logger.warn(`ID of the channel is required.`)
      return response(null, {
        message: 'ID of the channel is required.',
        code: ChannelError.MISSING_ID
      })
    }

    const channel = await this.channelsRepository.findOneBy({ id: channelId })
    if (!channel) {
      this.logger.warn(`Channel with ID : ${channelId} not found in database.`)
      return response(null, {
        message: `Channel with ID : ${channelId} not found in database.`,
        code: ChannelError.NOT_FOUND
      })
    }

    const messages = await this.messagesRepository.find({
      where: { channel: { id: channel.id } },
      relations: ['user']
    })

    this.logger.verbose(
      `Messages list of : ${channelId} successfully retrieved.`
    )

    return response(messages)
  }

  // *********** //
  // postMessage //
  // *********** //

  async postMessage(messageDto: MessageDto): Promise<ServiceResponse<Message>> {
    const { messageBody, channelId, userId } = messageDto

    // todo: check errors

    const channel = await this.findOne(channelId)

    const user = await this.userService.findOneById(userId)

    const newMessage = this.messagesRepository.create({
      messageBody,
      channel,
      user
    })

    const message = await this.messagesRepository.save(newMessage)

    this.chatGateway.server.to(channel.id).emit('message', message)

    return response(message)
  }
}
