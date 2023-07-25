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
  ) { }

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

  async getChannels(userId: string): Promise<Channel[]> {
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

    const channels = await this.channelsRepository
      .createQueryBuilder('channel')
      .leftJoinAndSelect('channel.members', 'members')
      .leftJoinAndSelect('channel.owner', 'owner')
      .where((qb) => {
        const subQuery = qb
          .subQuery()
          .select('channel.id')
          .from('channel', 'channel')
          .leftJoin('channel.members', 'members')
          .where('members.id = :userId', { userId })
          .getQuery();
        return 'channel.id IN ' + subQuery;
      })
      .getMany();

    this.logger.verbose(`DMs list of : ${userId} successfully retrieved.`)

    return channels
  }

  // *********** //
  // getMessages //
  // *********** //

  async getMessages(channelId: string): Promise<Message[]> {
    if (!channelId) {
      throw new BadRequestException('ID of the channel is required.')
    }

    const channel = await this.channelsRepository.findOneBy({ id: channelId })
    if (!channel) {
      this.logger.warn(`Channel with ID : ${channelId} not found in database.`)
      throw new NotFoundException(
        `Channel with ID : ${channelId} not found in database.`
      )
    }

    const messages = await this.messagesRepository.find({
      where: { channel: { id: channel.id } },
      relations: ['user']
    })

    this.logger.verbose(
      `Messages list of : ${channelId} successfully retrieved.`
    )

    console.log('messages : ', messages)

    return messages
  }

  // *********** //
  // postMessage //
  // *********** //

  async postMessage(messageDto: MessageDto): Promise<Message> {
    const { messageBody, channelId, userId, date } = messageDto

    // todo: check errors

    const channel = await this.findOne(channelId)

    const user = await this.userService.findOneById(userId)

    const newMessage = this.messagesRepository.create({
      messageBody,
      channel,
      user,
      createdAt: date
    })

    const message = await this.messagesRepository.save(newMessage)

    this.chatGateway.server.to(channel.id).emit('message', message)

    return message
  }
}
