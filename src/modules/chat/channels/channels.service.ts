import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DeleteResult, Not, Repository } from 'typeorm'

import {
  CannotActOnSelf,
  CannotKickBanMuteAdmin,
  ChannelNotFound,
  ChannelMembersNotFound,
  ChannelAlreadyExists,
  DmChannelMembersLimit,
  InvalidGroupPassword,
  MissingGroupPassword,
  MissingUserId,
  UserAlreadyAdmin,
  UserAlreadyBanned,
  UserAlreadyInChannel,
  UserIsBanned,
  UserNotFound,
  UserNotInChannel,
  UserAlreadyMuted,
  UserIsMuted,
  UserIsNotAdmin,
  UserIsNotBanned
} from '@/core/exceptions'
import { parseMuteTime } from '@/core/utils/parseMuteTime'
import { ChatGateway } from '@/modules/chat/chat.gateway'
import { CreateChannelDto } from '@/modules/chat/channels/dtos/create-channel.dto'
import { JoinGroupDto } from '@/modules/chat/channels/dtos/join-group.dto'
import { Channel, ChannelTypes } from '@/modules/chat/channels/entities/channel.entity'
import { Message } from '@/modules/chat/channels/entities/message.entity'
import { User } from '@/modules/users/user.entity'
import { UsersService } from '@/modules/users/users.service'
import { randomBytes, scrypt as _scrypt } from 'crypto'
import { promisify } from 'util'

const scrypt = promisify(_scrypt)

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
  ) { }

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
    banningUserId: string,
    userToBanId: string,
    channel: Channel
  ): Promise<Channel> {
    const userToBan: User = await this.checkExistingUser(userToBanId)

    await this.permissionChecker('ban', channel, banningUserId, userToBanId)

    channel.members = this.removeUserFromList(
      'members',
      userToBan,
      channel.members
    )

    channel.bannedMembers = this.addUserToList(
      'bannedMembers',
      userToBan,
      channel.bannedMembers ?? []
    )

    const updatePayload = { user: userToBan, channelId: channel.id }

    const updatedChannel = await this.updateChannel(
      'chat:ban',
      channel,
      updatePayload
    )

    const socket = this.chatGateway.getUserSocket(userToBan.id)
    if (socket) socket.leave(channel.id)

    return updatedChannel
  }

  // ************** //
  // changePassword //
  // ************** //

  // todo: implement group password policy and check if socket required here ?
  async changeGroupPassword(
    newPassword: string,
    channel: Channel
  ): Promise<OperationResult> {
    channel.password = newPassword

    await this.channelsRepository.save(channel)

    return { success: true }
  }

  // ************** //
  // deletePassword //
  // ************** //

  // todo: check if socket required here ?
  async deleteGroupPassword(channel: Channel): Promise<OperationResult> {
    channel.password = null
    channel.type = ChannelTypes.PUBLIC

    await this.channelsRepository.save(channel)

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

  // todo: implement group password policy
  async createChannel(
    createChannelDto: CreateChannelDto,
    ownerId: string
  ): Promise<Channel> {
    const existingChannel: Channel = await this.channelsRepository.findOne({
      where: { name: createChannelDto.name }
    })
    if (existingChannel) throw new ChannelAlreadyExists()

    const owner: User = await this.checkExistingUser(ownerId)

    const members: User[] = await this.userService.findByIds(
      createChannelDto.membersIds
    )
    if (!members || members.length < 2) throw new ChannelMembersNotFound()

    if (createChannelDto.type === ChannelTypes.DM && members.length > 2) {
      throw new DmChannelMembersLimit()
    }

    members.sort((a, b) => a.id.localeCompare(b.id))

    if (createChannelDto.type === ChannelTypes.DM) {
      const existingDm = await this.channelsRepository
        .createQueryBuilder('channel')
        .innerJoin('channel.members', 'member')
        .where('channel.type = :type', { type: ChannelTypes.DM })
        .andWhere('member.id IN (:...memberIds)', {
          memberIds: members.map((m) => m.id)
        })
        .groupBy('channel.id')
        .having('COUNT(member.id) = :membersCount', {
          membersCount: members.length
        })
        .getOne()

      if (existingDm) {
        throw new ChannelAlreadyExists()
      }
    }

    let hashedPassword: string = null
    if (createChannelDto.type === ChannelTypes.PROTECTED && createChannelDto.password) {
      const salt = randomBytes(8).toString('hex')
      const hash = (await scrypt(createChannelDto.password, salt, 32)) as Buffer
      hashedPassword = salt + '.' + hash.toString('hex')
    }

    const newChannel: Channel = this.channelsRepository.create({
      owner: owner,
      members: members,
      name: createChannelDto.type === ChannelTypes.DM ? null : createChannelDto.name,
      type: createChannelDto.type,
      password: createChannelDto.type !== ChannelTypes.PROTECTED ? null : hashedPassword
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
      where: { name, type: Not(ChannelTypes.DM && ChannelTypes.PRIVATE) },
      select: ['id', 'members', 'name', 'password', 'type'],
      relations: ['members', 'bannedMembers']
    })

    if (!channel) {
      this.logger.warn(`Channel with name : ${name} not found in database`)
      return null
    }

    return channel
  }

  async findAllWithMutedMembers(): Promise<Channel[]> {
    const currentDate = new Date()

    return await this.channelsRepository
      .createQueryBuilder('channel')
      .leftJoinAndSelect('channel.mutedMembers', 'mutedMembers')
      .leftJoinAndSelect('mutedMembers.user', 'mutedUser')
      .where('mutedMembers.muteEndDate <= :currentDate', { currentDate })
      .getMany()
  }

  // *********** //
  // getBannedMembers //
  // *********** //

  async getBannedMembers(channel: Channel): Promise<User[]> {
    const chan = await this.findOneById(channel.id)

    return chan.bannedMembers ?? []
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

    if (channel.isProtected() && !password) {
      throw new MissingGroupPassword()
    }

    if (channel.isProtected()) {
      const [salt, storedHash] = channel.password.split('.')

      const hash = (await scrypt(password, salt, 32)) as Buffer

      if (storedHash !== hash.toString('hex')) {
        throw new InvalidGroupPassword()
      }
    }

    channel.members = this.addUserToList(
      'members',
      newMember,
      channel.members ?? []
    )

    const updatePayload = { user: newMember, channelId: channel.id }

    const socket = this.chatGateway.getUserSocket(newMember.id)
    if (socket) socket.join(channel.id)

    await this.updateChannel('chat:join', channel, updatePayload)

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

    const updatePayload = { user: userToKick, channelId: channel.id }

    const updatedChannel = await this.updateChannel(
      'chat:kick',
      channel,
      updatePayload
    )

    const socket = this.chatGateway.getUserSocket(userToKick.id)
    if (socket) socket.leave(channel.id)

    return updatedChannel
  }

  // ********** //
  // leaveGroup //
  // ********** //

  async leaveGroup(
    leavingUserId: string,
    channel: Channel
  ): Promise<Channel | DeleteResult> {
    const leavingUser: User = await this.checkExistingUser(leavingUserId)

    if (channel.admins.find((admin) => admin.id === leavingUser.id)) {
      channel.admins = this.removeUserFromList(
        'admins',
        leavingUser,
        channel.admins
      )
    }

    channel.members = this.removeUserFromList(
      'members',
      leavingUser,
      channel.members
    )

    if (leavingUser.id === channel.owner.id) {
      if (channel.admins.length === 0) {
        return await this.channelsRepository.delete(channel.id)
      }

      const newOwner = channel.admins[0]
      channel.owner = newOwner
      channel.admins = this.removeUserFromList(
        'admins',
        newOwner,
        channel.admins
      )
    }

    const updatePayload = { user: leavingUser, channelId: channel.id }

    const updatedChannel = this.updateChannel(
      'chat:leave',
      channel,
      updatePayload
    )

    const socket = this.chatGateway.getUserSocket(leavingUser.id)
    if (socket) socket.leave(channel.id)

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

    if (channel.isMuted(userToMute)) {
      throw new UserAlreadyMuted()
    }

    // todo: add a string param to replace '1w'
    const muteEndDate = parseMuteTime('5s')

    channel.addMuteMember(userToMute, muteEndDate)

    const updatePayload = { user: userToMute, channelId: channel.id }

    await this.updateChannel('chat:mute', channel, updatePayload)

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
      case 'kick':
      case 'ban':
      case 'mute':
        if (targetIsAdmin === true && actingUserId !== channel.owner.id) {
          throw new CannotKickBanMuteAdmin()
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

    if (channel.isMuted(user)) {
      throw new UserIsMuted()
    }

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

  // todo: implement this (Lucas)
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
          throw new UserIsNotAdmin()
        case 'bannedMembers':
          throw new UserIsNotBanned()
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

  async setAdmin(userToPromoteId: string, channel: Channel): Promise<Channel> {
    const userToPromote: User = await this.checkExistingUser(userToPromoteId)

    channel.admins = this.addUserToList('admins', userToPromote, channel.admins)

    const updatePayload = { user: userToPromote, channelId: channel.id }

    const updatedChannel: Channel = await this.updateChannel(
      'chat:set-admin',
      channel,
      updatePayload
    )

    return updatedChannel
  }

  // *********** //
  // unbanMember //
  // *********** //

  async unbanMember(userToUnbanId: string, channel: Channel): Promise<Channel> {
    const userToUnban: User = await this.checkExistingUser(userToUnbanId)

    channel.bannedMembers = this.removeUserFromList(
      'bannedMembers',
      userToUnban,
      channel.bannedMembers
    )

    const updatePayload = { user: userToUnban, channelId: channel.id }

    const updatedChannel = await this.updateChannel(
      'chat:unban',
      channel,
      updatePayload
    )

    return updatedChannel
  }

  // ************ //
  // unMuteMember //
  // ************ //

  async unMuteMember(channel: Channel, userId: string): Promise<Channel> {
    const user: User = await this.checkExistingUser(userId)

    channel.removeMuteMember(user)

    return await this.updateChannel('chat:unmute', channel, {
      user,
      channelId: channel.id
    })
  }

  // ********** //
  // unsetAdmin //
  // ********** //

  async unsetAdmin(userToDemoteId: string, channel: Channel): Promise<Channel> {
    const userToDemote: User = await this.checkExistingUser(userToDemoteId)

    channel.admins = this.removeUserFromList(
      'admins',
      userToDemote,
      channel.admins
    )

    const updatePayload = { user: userToDemote, channelId: channel.id }

    const updatedChannel: Channel = await this.updateChannel(
      'chat:unset-admin',
      channel,
      updatePayload
    )

    return updatedChannel
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
