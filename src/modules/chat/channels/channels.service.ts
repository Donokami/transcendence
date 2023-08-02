import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
  forwardRef
} from '@nestjs/common'

import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { UserNotFound } from '@/core/exceptions/user'
import { Channel } from '@/modules/chat/channels/entities/channel.entity'
import { Message } from '@/modules/chat/channels/entities/message.entity'
import { User } from '@/modules/users/user.entity'
import { UsersService } from '@/modules/users/users.service'

import { CreateChannelDto } from './dtos/create-channel.dto'
import { MessageDto } from './dtos/message.dto'

import { ChatGateway } from '../chat.gateway'
import { DefaultEventsMap } from 'socket.io/dist/typed-events'
import { Socket } from 'socket.io'
import { JoinGroupDto } from './dtos/join-group.dto'
import { GetGroupByNameDto } from './dtos/get-group-by-name.dto'

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

  // ******** //
  // addAdmin //
  // ******** //

  async addAdmin(channelId: string, userId: string): Promise<Channel> {
    const channel = await this.checkExistingChannel(channelId)
    const user = await this.checkExistingUser(userId)

    channel.admins = this.addUserToList(user, channel.admins)

    return this.saveAndEmit(channel, 'set-admin', { userId, channelId })
  }

  // ********* //
  // banMember //
  // ********* //

  async banMember(channelId: string, userId: string): Promise<Channel> {
    const channel = await this.checkExistingChannel(channelId)
    const user = await this.checkExistingUser(userId)

    channel.bannedMembers = this.addUserToList(user, channel.bannedMembers)

    return this.saveAndEmit(channel, 'ban-user', { userId, channelId })
  }

  // ********** //
  // muteMember //
  // ********** //

  async muteMember(channelId: string, userId: string): Promise<Channel> {
    const channel = await this.checkExistingChannel(channelId)
    const user = await this.checkExistingUser(userId)

    channel.mutedMembers = this.addUserToList(user, channel.mutedMembers)

    return this.saveAndEmit(channel, 'mute-user', { userId, channelId })
  }

  // ********** //
  // kickMember //
  // ********** //

  async kickMember(channelId: string, userId: string): Promise<Channel> {
    const channel = await this.checkExistingChannel(channelId)
    const user = await this.checkExistingUser(userId)

    channel.kickedMembers = this.addUserToList(user, channel.kickedMembers)

    channel.members = this.removeUserFromList(user, channel.members)

    return this.saveAndEmit(channel, 'kick-user', { userId, channelId })
  }

  // ************* //
  // addUserToList //
  // ************* //

  private addUserToList(user: User, userList: User[]): User[] {
    if (userList.includes(user)) {
      // todo: how to handle this ? error or just return the list ?
      return userList
    }

    if (!userList.find((item) => item.id === user.id)) {
      userList.push(user)
    }
    return userList
  }

  // ******************** //
  // checkExistingChannel //
  // ******************** //

  async checkExistingChannel(channelId: string): Promise<Channel> {
    if (!channelId) {
      this.logger.warn(`ID of the channel is required.`)
      throw new BadRequestException('ID of the channel is required.')
    }

    const channel = await this.channelsRepository.findOneBy({ id: channelId })
    if (!channel) {
      this.logger.warn(`Channel with ID : ${channelId} not found in database.`)
      throw new NotFoundException(
        `Channel with ID : ${channelId} not found in database.`
      )
    }

    return channel
  }

  // ***************** //
  // checkExistingUser //
  // ***************** //

  async checkExistingUser(userId: string): Promise<User> {
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
    return user
  }

  // *************** //
  // createDmChannel //
  // *************** //

  async createChannel(createChannelDto: CreateChannelDto): Promise<Channel> {
    const owner: User = await this.userService.findOneById(
      createChannelDto.ownerId
    )
    if (!owner) {
      this.logger.warn(
        `User with ID : ${createChannelDto.ownerId} not found in database.`
      )
      throw new NotFoundException(
        `User with ID : ${createChannelDto.ownerId} not found in database.`
      )
    }

    const members: User[] = await this.userService.findByIds(
      createChannelDto.membersIds
    )
    if (!members || members.length === 0) {
      this.logger.warn('No members found for the given IDs.')
      throw new NotFoundException('No members found for the given IDs.')
    }

    const newDmChannel = this.channelsRepository.create({
      isDm: createChannelDto.isDm,
      owner: owner,
      members: members,
      name: createChannelDto.isDm ? null : createChannelDto.name,
      passwordRequired: createChannelDto.isDm ? false : createChannelDto.passwordRequired,
      password: createChannelDto.isDm ? null : createChannelDto.password
    })

    const dmChannel = await this.channelsRepository.save(newDmChannel)

    dmChannel.members.forEach((member) => {
      const socketId = this.chatGateway.connectedUsers.get(member.id)
      if (socketId) {
        const socket = (
          this.chatGateway.server.sockets as unknown as Map<
            string,
            Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
          >
        ).get(socketId)
        if (socket) socket.join(dmChannel.id)
      }
    })

    return dmChannel
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
    if (!owner) {
      this.logger.warn(
        `User with ID : ${createChannelDto.ownerId} not found in database.`
      )
      throw new NotFoundException(
        `User with ID : ${createChannelDto.ownerId} not found in database.`
      )
    }

    const members: User[] = await this.userService.findByIds(
      createChannelDto.membersIds
    )
    if (!members || members.length === 0) {
      this.logger.warn('No members found for the given IDs.')
      throw new NotFoundException('No members found for the given IDs.')
    }

    const newGroupChannel = this.channelsRepository.create({
      isDm: false,
      name: createChannelDto.name,
      owner: owner,
      members: members,
      admins: [owner],
      passwordRequired: createChannelDto.passwordRequired,
      password: createChannelDto.password
    })

    const groupChannel = await this.channelsRepository.save(newGroupChannel)

    groupChannel.members.forEach((member) => {
      const socketId = this.chatGateway.connectedUsers.get(member.id)
      if (socketId) {
        const socket = (
          this.chatGateway.server.sockets as unknown as Map<
            string,
            Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
          >
        ).get(socketId)
        if (socket) socket.join(groupChannel.id)
      }
    })

    return groupChannel
  }

  // ******* //
  // findOne //
  // ******* //

  async findOne(id: string) {
    if (!id) {
      this.logger.warn(`ID of the channel is required.`)
      throw new BadRequestException('ID of the channel is required.')
    }

    const channel = await this.channelsRepository.findOne({
      where: { id },
      relations: [
        'admins',
        'bannedMembers',
        'kickedMembers',
        'members',
        'mutedMembers',
        'owner'
      ]
    })

    if (!channel) {
      throw new NotFoundException(`There is no channel under id ${id}`)
    }

    return channel
  }

  // ************* //
  // findOneByName //
  // ************* //

  async findOneByName(name: string) {
    const channel = await this.channelsRepository.findOne({
      where: { name },
      select: ['id', 'name', 'passwordRequired'],
      relations: [
        'admins',
        'bannedMembers',
        'kickedMembers',
        'members',
        'owner'
      ]
    })

    if (!channel) return null

    return channel
  }

  // ********* //
  // joinGroup //
  // ********* //

  async joinGroup(joinGroupDto: JoinGroupDto, newMemberId: string) {
    const { channelName, password } = joinGroupDto

    const newMember = await this.usersRepository.findOne({
      where: { id: newMemberId }
    })
    if (!newMember) {
      this.logger.warn(`User with ID : ${newMemberId} not found in database.`)
      throw new UserNotFound()
    }

    const channel = await this.channelsRepository.findOne({
      where: { name: channelName },
      relations: ['members', 'bannedMembers']
    })
    if (!channel)
      throw new NotFoundException(
        `Channel with name : ${channelName} does not exist`
      )

    if (channel.passwordRequired && channel.password !== password) {
      throw new UnauthorizedException('Invalid password')
    }

    if (!channel.members.find((member) => member.id === newMember.id)) {
      throw new BadRequestException('User is already a member of this channel')
    }

    channel.members.push(newMember)

    await this.channelsRepository.save(channel)

    const socketId = this.chatGateway.connectedUsers.get(newMember.id)
    if (socketId) {
      const socket = (
        this.chatGateway.server.sockets as unknown as Map<
          string,
          Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
        >
      ).get(socketId)
      if (socket) socket.join(channel.id)
    }
  }

  // ********* //
  // getDmList //
  // ********* //

  async getChannels(userId: string): Promise<Channel[]> {
    const user = await this.checkExistingUser(userId)

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
    const channel = await this.checkExistingChannel(channelId)

    const messages = await this.messagesRepository.find({
      where: { channel: { id: channel.id } },
      relations: ['user']
    })

    this.logger.verbose(
      `Messages list of : ${channelId} successfully retrieved.`
    )
    return messages
  }

  // *********** //
  // postMessage //
  // *********** //

  async postMessage(messageDto: MessageDto): Promise<Message> {
    const { messageBody, channelId, userId, date } = messageDto

    // todo: check errors
    // const channel = await this.findOne(channelId)
    // const user = await this.userService.findOneById(userId)

    const channel = await this.checkExistingChannel(channelId)
    const user = await this.checkExistingUser(userId)

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

  // *********** //
  // removeAdmin //
  // *********** //

  async removeAdmin(channelId: string, userId: string): Promise<Channel> {
    const channel = await this.checkExistingChannel(channelId)
    const user = await this.checkExistingUser(userId)

    channel.admins = this.removeUserFromList(user, channel.admins)

    return this.channelsRepository.save(channel)
  }

  // *********** //
  // unBanMember //
  // *********** //

  async unBanMember(channelId: string, userId: string): Promise<Channel> {
    const channel = await this.checkExistingChannel(channelId)
    const user = await this.checkExistingUser(userId)

    channel.bannedMembers = this.removeUserFromList(user, channel.bannedMembers)

    return this.channelsRepository.save(channel)
  }

  // ************ //
  // unMuteMember //
  // ************ //

  async unMuteMember(channelId: string, userId: string): Promise<Channel> {
    const channel = await this.checkExistingChannel(channelId)
    const user = await this.checkExistingUser(userId)

    channel.mutedMembers = this.removeUserFromList(user, channel.mutedMembers)

    return this.channelsRepository.save(channel)
  }

  // ************ //
  // unKickMember //
  // ************ //

  async unKickMember(channelId: string, userId: string): Promise<Channel> {
    const channel = await this.checkExistingChannel(channelId)
    const user = await this.checkExistingUser(userId)

    channel.kickedMembers = this.removeUserFromList(user, channel.kickedMembers)

    return this.channelsRepository.save(channel)
  }

  // ****************** //
  // removeUserFromList //
  // ****************** //

  private removeUserFromList(user: User, userList: User[]): User[] {
    if (!userList.includes(user)) {
      // todo: how to handle this ? error or just return the list ?
      return userList
    }

    const index = userList.findIndex((item) => item.id === user.id)
    if (index !== -1) {
      userList.splice(index, 1)
    }

    return userList
  }

  // *********** //
  // saveAndEmit //
  // *********** //

  private async saveAndEmit(
    updatedChannel: Channel,
    event: string,
    payload: any
  ): Promise<Channel> {
    const savedChannel = await this.channelsRepository.save(updatedChannel)

    this.chatGateway.server.to(updatedChannel.id).emit(event, payload)

    return savedChannel
  }
}
