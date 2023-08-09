import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common'

import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import {
  CannotActOnSelf,
  CannotModifyPassword,
  CannotKickBanMuteAdmin,
  CannotSetAdmin,
  ChannelNotFound,
  ChannelMembersNotFound,
  InvalidGroupPassword,
  MissingGroupPassword,
  MissingUserId,
  UserAlreadyAdmin,
  UserAlreadyBanned,
  UserAlreadyInChannel,
  UserIsBanned,
  UserNotFound,
  UserNotInChannel
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

export interface OperationResult {
  success: boolean
}

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

  async banMember(
    userId: string,
    memberToBanId: string,
    channel: Channel
  ): Promise<Channel> {
    const memberToBan: User = await this.checkExistingUser(memberToBanId)

    await this.permissionChecker('ban', channel, userId, memberToBanId)

    channel.members = this.removeUserFromList(
      'members',
      memberToBan,
      channel.members
    )

    channel.bannedMembers = this.addUserToList(
      'bannedMembers',
      memberToBan,
      channel.bannedMembers
    )

    const updatePayload = { memberToBanId, channelId: channel.id }

    const updatedChannel = this.updateChannel('ban', channel, updatePayload)

    return updatedChannel
  }

  // ************** //
  // changePassword //
  // ************** //

  // todo: check what we want as group password policy
  async changePassword(
    userId: string,
    newPassword: string,
    channel: Channel
  ): Promise<OperationResult> {
    const user: User = await this.checkExistingUser(userId)

    await this.permissionChecker('change-password', channel, userId)

    channel.password = newPassword

    const updatePayload = { user, channelId: channel.id }

    await this.updateChannel('change-password', channel, updatePayload)

    return { success: true }
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

  // todo: check what we want as group password policy
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
      select: ['id', 'members', 'name', 'password', 'passwordRequired'],
      relations: ['members', 'bannedMembers']
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
      .leftJoinAndSelect('channel.admins', 'admins')
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

  async joinGroup(
    newMemberId: string,
    joinGroupDto: JoinGroupDto
  ): Promise<OperationResult> {
    const { channelName, password } = joinGroupDto

    const newMember: User = await this.checkExistingUser(newMemberId)

    const channel: Channel = await this.findOneByName(channelName)
    if (!channel) {
      throw new ChannelNotFound()
    }

    if (
      channel.bannedMembers.find(
        (bannedMember) => bannedMember.id === newMember.id
      )
    )
      throw new UserIsBanned()

    if (channel.passwordRequired && !password) {
      throw new MissingGroupPassword()
    }

    if (channel.passwordRequired && password !== channel.password) {
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
    kickingUserId: string,
    userToKickId: string,
    channel: Channel
  ): Promise<Channel> {
    const userToKick: User = await this.checkExistingUser(userToKickId)

    await this.permissionChecker('kick', channel, kickingUserId, userToKickId)

    channel.members = this.removeUserFromList(
      'members',
      userToKick,
      channel.members
    )

    const updatePayload = { userToKickId, channelId: channel.id }

    const updatedChannel = this.updateChannel('kick', channel, updatePayload)

    return updatedChannel
  }

  // ********** //
  // leaveGroup //
  // ********** //

  async leaveGroup(userId: string, channel: Channel): Promise<Channel> {
    const leavingMember: User = await this.checkExistingUser(userId)

    channel.members = this.removeUserFromList(
      'members',
      leavingMember,
      channel.members
    )

    const updatePayload = { userId, channelId: channel.id }

    const updatedChannel = this.updateChannel('leave', channel, updatePayload)

    return updatedChannel
  }

  // ********** //
  // muteMember //
  // ********** //

  async muteMember(
    mutingUserId: string,
    userToMuteId: string,
    channel: Channel
  ): Promise<OperationResult> {
    const userToMute: User = await this.checkExistingUser(userToMuteId)

    await this.permissionChecker('mute', channel, mutingUserId, userToMuteId)

    // todo: add a string param to replace '1w'
    const muteEndDate = parseMuteTime('1w')

    channel.addMuteMember(userToMute, muteEndDate)

    return { success: true }
  }

  // ***************** //
  // permissionChecker //
  // ***************** //

  async permissionChecker(
    action: string,
    channel: Channel,
    actingUserId: string,
    targetUserId?: string
  ): Promise<boolean> {
    if (actingUserId === targetUserId) {
      throw new CannotActOnSelf()
    }

    const targetIsAdmin: boolean = channel.admins.some(
      (admin) => admin.id === targetUserId
    )

    switch (action) {
      case 'set-admin':
        if (actingUserId !== channel.owner.id) {
          throw new CannotSetAdmin()
        }
        break
      case 'kick':
      case 'ban':
      case 'mute':
        if (targetIsAdmin === true && actingUserId !== channel.owner.id) {
          throw new CannotKickBanMuteAdmin()
        }
        break
      case 'change-password':
      case 'set-password': // todo: function to implement if necessary
      case 'remove-password': // todo: function to implement if necessary
        if (actingUserId !== channel.owner.id) {
          throw new CannotModifyPassword()
        }
        break
      default:
        throw new Error(`Invalid action: ${action}`)
    }

    return true
  }

  // *********** //
  // postMessage //
  // *********** //

  async postMessage(
    userId: string,
    messageBody: string,
    date: any,
    channel: Channel
  ): Promise<Message> {
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

  // todo: remove if not required
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

  // ******** //
  // setAdmin //
  // ******** //

  async setAdmin(
    promotingUserId: string,
    userToPromoteId: string,
    channel: Channel
  ): Promise<Channel> {
    const userToPromote: User = await this.checkExistingUser(userToPromoteId)

    await this.permissionChecker(
      'set-admin',
      channel,
      promotingUserId,
      userToPromoteId
    )

    channel.admins = this.addUserToList('admins', userToPromote, channel.admins)

    const updatePayload = { userToPromoteId, channelId: channel.id }

    const updatedChannel: Channel = await this.updateChannel(
      'set-admin',
      channel,
      updatePayload
    )

    return updatedChannel
  }

  // *********** //
  // unBanMember //
  // *********** //

  // todo: remove if not required
  async unBanMember(channel: Channel, userId: string): Promise<Channel> {
    const user: User = await this.checkExistingUser(userId)

    channel.bannedMembers = this.removeUserFromList(
      'bannedMember',
      user,
      channel.bannedMembers
    )

    return this.channelsRepository.save(channel)
  }

  // *********** //
  // unMuteMember //
  // *********** //

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
