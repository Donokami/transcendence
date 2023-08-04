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
  InvalidGroupPassword,
  CannotKickOwner,
  CannotKickYourself,
  CannotKickAdmin
} from '@/core/exceptions'
import { parseMuteTime } from '@/core/utils/parseMuteTime'
import { ChatGateway } from '@/modules/chat/chat.gateway'
import { CreateChannelDto } from '@/modules/chat/channels/dtos/create-channel.dto'
import { JoinGroupDto } from '@/modules/chat/channels/dtos/join-group.dto'
import { MessageDto } from '@/modules/chat/channels/dtos/message.dto'
import { Channel } from '@/modules/chat/channels/entities/channel.entity'
import { Message } from '@/modules/chat/channels/entities/message.entity'
import { User } from '@/modules/users/user.entity'
import { UsersService } from '@/modules/users/users.service'

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

  async addAdmin(channel: Channel, userId: string): Promise<Channel> {
    const user: User = await this.checkExistingUser(userId)

    channel.admins = this.addUserToList('admins', user, channel.admins)

    const updatePayload = { userId, channelId: channel.id }

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

  // todo (Lucas): check what is better between push and concat
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

    // userList.push(user)

    // return userList
    return userList.concat(user)
  }

  // ********* //
  // banMember //
  // ********* //

  async banMember(channel: Channel, userId: string): Promise<Channel> {
    const user: User = await this.checkExistingUser(userId)

    channel.members = this.removeUserFromList('members', user, channel.members)

    channel.bannedMembers = this.addUserToList(
      'bannedMembers',
      user,
      channel.bannedMembers
    )

    const updatePayload = { userId, channelId: channel.id }

    const updatedChannel = this.updateChannel(
      'ban-user',
      channel,
      updatePayload
    )

    return updatedChannel
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

  async createChannel(
    createChannelDto: CreateChannelDto,
    ownerId: string
  ): Promise<Channel> {
    const owner: User = await this.checkExistingUser(ownerId)

    const members: User[] = await this.userService.findByIds(
      createChannelDto.membersIds
    )
    if (!members || members.length < 2) throw new ChannelMembersNotFound()

    const newChannel: Channel = this.channelsRepository.create({
      isDm: createChannelDto.isDm,
      owner: owner,
      members: members,
      name: createChannelDto.isDm ? null : createChannelDto.name,
      passwordRequired: createChannelDto.isDm
        ? false
        : !!createChannelDto.password,
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
      where: { name, isDm: false },
      select: ['id', 'name', 'passwordRequired', 'password'],
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

  async getMessages(channel: Channel): Promise<Message[]> {
    const messages: Message[] = await this.messagesRepository.find({
      where: { channel: { id: channel.id } },
      relations: ['user']
    })

    this.logger.verbose(
      `Messages of channel with ID : ${channel.id} successfully retrieved.`
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

    console.log(channel.passwordRequired, password, channel.password)

    if (
      (channel.passwordRequired && !password) ||
      password !== channel.password
    ) {
      throw new InvalidGroupPassword()
    }

    channel.members = this.addUserToList('members', newMember, channel.members)

    await this.channelsRepository.save(channel)

    const socket = this.chatGateway.getUserSocket(newMember.id)
    if (socket) socket.join(channel.id)
    return { success: true }
  }

  // ********** //
  // kickMember //
  // ********** //

  async kickMember(
    requestUserId: string,
    channel: Channel,
    userId: string
  ): Promise<Channel> {
    const user: User = await this.checkExistingUser(userId)

    // todo (Lucas): create a permission handler function
    if (userId === channel.owner.id) {
      throw new CannotKickOwner()
    }

    if (requestUserId === userId) {
      throw new CannotKickYourself()
    }

    if (requestUserId !== channel.owner.id && channel.isAdmin(user)) {
      throw new CannotKickAdmin()
    }

    channel.members = this.removeUserFromList('members', user, channel.members)

    const updatePayload = { userId, channelId: channel.id }

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

  async muteMember(channel: Channel, userId: string): Promise<void> {
    const user: User = await this.checkExistingUser(userId)

    // todo: add a string param to replace '1w'
    const muteEndDate = parseMuteTime('1w')

    channel.addMuteMember(user, muteEndDate)
  }

  // *********** //
  // postMessage //
  // *********** //

  async postMessage(userId: string, messageDto: MessageDto): Promise<Message> {
    const { messageBody, channel, date } = messageDto

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

  async removeAdmin(channel: Channel, userId: string): Promise<Channel> {
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

    return userList.filter((item) => item.id !== user.id)
  }

  // *********** //
  // unBanMember //
  // *********** //

  async unBanMember(channel: Channel, userId: string): Promise<Channel> {
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

  async unMuteMember(channel: Channel, userId: string): Promise<Channel> {
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
