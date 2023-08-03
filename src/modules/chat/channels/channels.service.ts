import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common'

import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import {
  ChannelNotFound,
  ChannelMembersNotFound,
  MissingChannelId,
  MissingUserId,
  UserAlreadyAdmin,
  UserAlreadyBanned,
  UserAlreadyInChannel,
  UserNotFound,
  UserNotInChannel,
  InvalidGroupPassword
} from '@/core/exceptions'

import { Channel } from '@/modules/chat/channels/entities/channel.entity'
import { Message } from '@/modules/chat/channels/entities/message.entity'
import { User } from '@/modules/users/user.entity'
import { UsersService } from '@/modules/users/users.service'

import { CreateChannelDto } from './dtos/create-channel.dto'
import { MessageDto } from './dtos/message.dto'

import { ChatGateway } from '../chat.gateway'
import { JoinGroupDto } from './dtos/join-group.dto'
import { parseMuteTime } from '@/core/utils/parseMuteTime'

@Injectable()
export class ChannelsService {
  constructor(
    @InjectRepository(Channel)
    private readonly channelsRepository: Repository<Channel>,
    @InjectRepository(Message)
    private readonly messagesRepository: Repository<Message>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
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

  // ******** //
  // addAdmin //
  // ******** //

  async addAdmin(channelId: string, userId: string): Promise<Channel> {
    const channel: Channel = await this.checkExistingChannel(channelId)

    const user: User = await this.checkExistingUser(userId)

    channel.admins = this.addUserToList('admins', user, channel.admins)

    const updatePayload = { userId, channelId }

    const updatedChannel: Channel = await this.updateChannel(
      'set-admin',
      channel,
      updatePayload
    )

    return updatedChannel
  }

  // ************* //
  // addUserToList //
  // ************* //

  private addUserToList(
    listName: string,
    user: User,
    userList: User[]
  ): User[] {
    if (userList.find((item) => item.id === user.id)) {
      switch (listName) {
        case 'admins':
          throw new UserAlreadyAdmin()
        case 'bannedMembers':
          throw new UserAlreadyBanned()
        case 'members':
          throw new UserAlreadyInChannel()
        default:
          throw new Error('addUserToList Failed')
      }
    }

    userList.push(user)

    return userList
  }

  // ********* //
  // banMember //
  // ********* //

  async banMember(channelId: string, userId: string): Promise<Channel> {
    const channel: Channel = await this.checkExistingChannel(channelId)

    const user: User = await this.checkExistingUser(userId)

    channel.members = this.removeUserFromList('members', user, channel.members)

    channel.bannedMembers = this.addUserToList(
      'bannedMembers',
      user,
      channel.bannedMembers
    )

    const updatePayload = { userId, channelId }

    const updatedChannel = this.updateChannel(
      'ban-user',
      channel,
      updatePayload
    )

    return updatedChannel
  }

  // ******************** //
  // checkExistingChannel //
  // ******************** //

  async checkExistingChannel(channelId: string): Promise<Channel> {
    if (!channelId) {
      this.logger.warn(`Channel ID is required but missing`)
      throw new MissingChannelId()
    }

    const channel: Channel = await this.channelsRepository.findOneBy({
      id: channelId
    })
    if (!channel) {
      this.logger.warn(`Channel with ID : ${channelId} not found`)
      throw new ChannelNotFound()
    }

    return channel
  }

  // ***************** //
  // checkExistingUser //
  // ***************** //

  async checkExistingUser(userId: string): Promise<User> {
    if (!userId) {
      this.logger.warn(`User ID is required but missing`)
      throw new MissingUserId()
    }

    const user: User = await this.userService.findOneById(userId)
    if (!user) {
      this.logger.warn(`User with ID : ${userId} not found`)
      throw new UserNotFound()
    }

    return user
  }

  // ************* //
  // createChannel //
  // ************* //

  async createChannel(createChannelDto: CreateChannelDto): Promise<Channel> {
    const owner: User = await this.checkExistingUser(createChannelDto.ownerId)

    const members: User[] = await this.userService.findByIds(
      createChannelDto.membersIds
    )
    if (!members || members.length === 0) throw new ChannelMembersNotFound()

    const newChannel: Channel = this.channelsRepository.create({
      isDm: createChannelDto.isDm,
      owner: owner,
      members: members,
      name: createChannelDto.isDm ? null : createChannelDto.name,
      passwordRequired: createChannelDto.isDm
        ? false
        : createChannelDto.passwordRequired,
      password: createChannelDto.isDm ? null : createChannelDto.password
    })

    const channel: Channel = await this.channelsRepository.save(newChannel)

    channel.members.forEach((member) => {
      const socket = this.chatGateway.getUserSocket(member.id)
      if (socket) socket.join(channel.id)
    })

    this.chatGateway.server.to(channel.id).emit('chat:channel-created', channel)

    return channel
  }

  // *********** //
  // findOneById //
  // *********** //

  async findOneById(id: string): Promise<Channel> {
    const channel: Channel = await this.channelsRepository.findOne({
      where: { id },
      relations: ['owner', 'members', 'admins', 'bannedMembers', 'mutedMembers']
    })

    if (!channel) {
      this.logger.warn(`Channel with ID : ${id} not found in database`)
      return null
    }

    return channel
  }

  // ************* //
  // findOneByName //
  // ************* //

  async findOneByName(name: string): Promise<Channel> {
    const channel: Channel = await this.channelsRepository.findOne({
      where: { name },
      select: ['id', 'name', 'passwordRequired'],
      relations: ['owner', 'members', 'admins', 'bannedMembers', 'mutedMembers']
    })

    if (!channel) {
      this.logger.warn(`Channel with name : ${name} not found in database`)
      return null
    }

    return channel
  }

  // *********** //
  // getChannels //
  // *********** //

  async getChannels(userId: string): Promise<Channel[]> {
    const user: User = await this.checkExistingUser(userId)

    const channels: Channel[] = await this.channelsRepository
      .createQueryBuilder('channel')
      .leftJoinAndSelect('channel.members', 'members')
      .leftJoinAndSelect('channel.owner', 'owner')
      .where((qb) => {
        const subQuery = qb
          .subQuery()
          .select('channel.id')
          .from('channel', 'channel')
          .leftJoin('channel.members', 'members')
          .where('members.id = :userId', { userId: user.id })
          .getQuery()
        return 'channel.id IN ' + subQuery
      })
      .getMany()

    this.logger.verbose(`DMs list of : ${userId} successfully retrieved.`)

    return channels
  }

  // *********** //
  // getMessages //
  // *********** //

  async getMessages(channelId: string): Promise<Message[]> {
    const channel: Channel = await this.checkExistingChannel(channelId)

    const messages: Message[] = await this.messagesRepository.find({
      where: { channel: { id: channel.id } },
      relations: ['user']
    })

    this.logger.verbose(
      `Messages of channel with ID : ${channelId} successfully retrieved.`
    )

    return messages
  }

  // **************** //
  // getMutedChannels //
  // **************** //

  async getMutedChannels(userId: string): Promise<Channel[]> {
    const user: User = await this.checkExistingUser(userId)

    const channels: Channel[] = await this.channelsRepository
      .createQueryBuilder('channel')
      .leftJoinAndSelect('channel.mutedMembers', 'mutedMembers')
      .where((qb) => {
        const subQuery = qb
          .subQuery()
          .select('channel.id')
          .from('channel', 'channel')
          .leftJoin('channel.mutedMembers', 'mutedMembers')
          .where('mutedMembers.id = :userId', { userId: user.id })
          .getQuery()
        return 'channel.id IN ' + subQuery
      })
      .getMany()

    this.logger.verbose(`Muted channels of : ${userId} successfully retrieved.`)

    return channels
  }

  // ********* //
  // joinGroup //
  // ********* //

  async joinGroup(joinGroupDto: JoinGroupDto, newMemberId: string) {
    const { channelName, password } = joinGroupDto

    const newMember: User = await this.checkExistingUser(newMemberId)

    const channel: Channel = await this.findOneByName(channelName)
    if (!channel) {
      throw new ChannelNotFound()
    }

    if (channel.passwordRequired && password !== channel.password) {
      throw new InvalidGroupPassword()
    }

    channel.members = this.addUserToList('members', newMember, channel.members)

    await this.channelsRepository.save(channel)

    const socket = this.chatGateway.getUserSocket(newMember.id)
    if (socket) socket.join(channel.id)
  }

  // ********** //
  // kickMember //
  // ********** //

  async kickMember(channelId: string, userId: string): Promise<Channel> {
    const channel: Channel = await this.checkExistingChannel(channelId)

    const user: User = await this.checkExistingUser(userId)

    channel.members = this.removeUserFromList('members', user, channel.members)

    const updatePayload = { userId, channelId }

    const updatedChannel = this.updateChannel(
      'kick-user',
      channel,
      updatePayload
    )

    return updatedChannel
  }

  // ********** //
  // muteMember //
  // ********** //

  async muteMember(channelId: string, userId: string): Promise<void> {
    const channel: Channel = await this.checkExistingChannel(channelId)

    const user: User = await this.checkExistingUser(userId)

    // todo: add a string param to replace '1w'
    const muteEndDate = parseMuteTime('1w')

    channel.addMuteMember(user, muteEndDate)
  }

  // *********** //
  // postMessage //
  // *********** //

  async postMessage(messageDto: MessageDto): Promise<Message> {
    const { messageBody, channelId, userId, date } = messageDto

    const channel: Channel = await this.checkExistingChannel(channelId)

    const user: User = await this.checkExistingUser(userId)

    const newMessage = this.messagesRepository.create({
      messageBody,
      channel,
      user,
      createdAt: date
    })

    const message = await this.messagesRepository.save(newMessage)

    this.chatGateway.server.to(channel.id).emit('chat:message', message)

    return message
  }

  // *********** //
  // removeAdmin //
  // *********** //

  async removeAdmin(channelId: string, userId: string): Promise<Channel> {
    const channel: Channel = await this.checkExistingChannel(channelId)

    const user: User = await this.checkExistingUser(userId)

    channel.admins = this.removeUserFromList('admins', user, channel.admins)

    return this.channelsRepository.save(channel)
  }

  // ****************** //
  // removeUserFromList //
  // ****************** //

  private removeUserFromList(
    listName: string,
    user: User,
    userList: User[]
  ): User[] {
    if (!userList.find((item) => item.id === user.id)) {
      switch (listName) {
        case 'admins':
          throw new UserAlreadyAdmin()
        case 'bannedMembers':
          throw new UserAlreadyBanned()
        case 'members':
          throw new UserNotInChannel()
        default:
          throw new Error('removeUserToList Failed')
      }
    }

    const index = userList.findIndex((item) => item.id === user.id)
    if (index !== -1) {
      userList.splice(index, 1)
    }

    return userList
  }

  // *********** //
  // unBanMember //
  // *********** //

  async unBanMember(channelId: string, userId: string): Promise<Channel> {
    const channel: Channel = await this.checkExistingChannel(channelId)

    const user: User = await this.checkExistingUser(userId)

    channel.bannedMembers = this.removeUserFromList(
      'bannedMember',
      user,
      channel.bannedMembers
    )

    return this.channelsRepository.save(channel)
  }

  // ************ //
  // unMuteMember //
  // ************ //

  async unMuteMember(channelId: string, userId: string): Promise<Channel> {
    const channel: Channel = await this.checkExistingChannel(channelId)

    const user: User = await this.checkExistingUser(userId)

    channel.removeMuteMember(user)

    return this.channelsRepository.save(channel)
  }

  // ************* //
  // updateChannel //
  // ************* //

  private async updateChannel(
    event: string,
    channelToUpdate: Channel,
    payload: any
  ): Promise<Channel> {
    const savedChannel = await this.channelsRepository.save(channelToUpdate)

    this.chatGateway.server.to(savedChannel.id).emit(event, payload)

    return savedChannel
  }
}
