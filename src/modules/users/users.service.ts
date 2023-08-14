import { Injectable, Logger, BadRequestException } from '@nestjs/common'
import { In, Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { ConfigService } from '@nestjs/config'
import {
  FilterOperator,
  FilterSuffix,
  PaginateQuery,
  paginate,
  Paginated
} from 'nestjs-paginate'

import { type Channel } from '@/modules/chat/channels/entities/channel.entity'
import { type IUserDetails } from '@/core/types/user-details'
import {
  Friendship,
  FriendshipStatus
} from '@/modules/social/entities/friendship.entity'

import { randomUUID } from 'crypto'
import * as path from 'path'
import * as fs from 'fs'

import { User } from './user.entity'
import { UserNotFound, UserNotInChannel } from '@/core/exceptions'
import { Subject } from 'rxjs'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Friendship)
    private readonly friendshipRepository: Repository<Friendship>,
    private readonly configService: ConfigService
  ) {}

  // ****** //
  // LOGGER //
  // ****** //

  private logger: Logger = new Logger(UsersService.name)
  private shutdownListener$: Subject<void> = new Subject()

  // ******************** //
  // FUNCTION DEFINITIONS //
  // ******************** //

  // onModuleDestroy() {
  //   this.logger.log('Shutting down...')
  // }

  // subscribeToShutdown(shutdownFn: () => void): void {
  //   this.shutdownListener$.subscribe(() => shutdownFn())
  // }

  // shutdown() {
  //   this.shutdownListener$.next()
  // }

  // ****** //
  // create //
  // ****** //

  async create(username: string, password: string): Promise<User> {
    const user = this.userRepository.create({ password, username })
    return await this.userRepository.save(user)
  }

  // *********** //
  // createOauth //
  // *********** //

  createOauth(details: IUserDetails) {
    const user = this.userRepository.create(details)
    return this.userRepository.save(user)
  }

  // ******* //
  // findAll //
  // ******* //

  async findAll(query: PaginateQuery): Promise<Paginated<User>> {
    return paginate(query, this.userRepository, {
      sortableColumns: ['id'],
      nullSort: 'last',
      defaultSortBy: [['id', 'DESC']],
      searchableColumns: ['username', 'status'],
      filterableColumns: {
        name: [FilterOperator.EQ, FilterSuffix.NOT],
        status: [FilterOperator.EQ, FilterSuffix.NOT]
      }
    })
  }

  // **************** //
  // findAllWithStats //
  // **************** //

  async findAllWithStats(query: PaginateQuery): Promise<Paginated<User>> {
    return paginate(query, this.userRepository, {
      sortableColumns: [
        'id',
        'gamesPlayed',
        'win',
        'loss',
        'winRate',
        'pointsScored',
        'pointsConceded',
        'pointsDifference',
        'createdAt',
        'updatedAt'
      ],
      nullSort: 'last',
      defaultSortBy: [['id', 'DESC']],
      searchableColumns: [
        'username',
        'status',
        'gamesPlayed',
        'win',
        'loss',
        'winRate',
        'pointsScored',
        'pointsConceded',
        'pointsDifference'
      ],
      filterableColumns: {
        name: [FilterOperator.EQ, FilterSuffix.NOT],
        status: [FilterOperator.EQ, FilterSuffix.NOT],
        gamesPlayed: [FilterOperator.EQ, FilterSuffix.NOT],
        win: [FilterOperator.EQ, FilterSuffix.NOT],
        loss: [FilterOperator.EQ, FilterSuffix.NOT],
        winRate: [FilterOperator.EQ, FilterSuffix.NOT],
        pointsScored: [FilterOperator.EQ, FilterSuffix.NOT],
        pointsConceded: [FilterOperator.EQ, FilterSuffix.NOT],
        pointsDifference: [FilterOperator.EQ, FilterSuffix.NOT]
      },
      select: [
        'id',
        'username',
        'status',
        'profilePicture',
        'gamesPlayed',
        'win',
        'loss',
        'winRate',
        'pointsScored',
        'pointsConceded',
        'pointsDifference'
      ]
    })
  }

  // ********* //
  // findByIds //
  // ********* //

  async findByIds(userIds: string[]): Promise<User[]> {
    return this.userRepository.find({
      where: {
        id: In(userIds)
      }
    })
  }

  // ***************** //
  // findOneByUsername //
  // ***************** //

  async findOneByUsername(username: string): Promise<User> {
    if (!username) {
      return null
    }

    const user = await this.userRepository.findOne({ where: { username } })

    return user
  }

  // ************************** //
  // findOneByUserWithAuthInfos //
  // ************************** //

  async findOneByUsernameWithAuthInfos(username: string): Promise<User> {
    if (!username) {
      return null
    }

    const user = await this.userRepository.findOne({
      where: { username },
      select: [
        'id',
        'username',
        'password',
        'twoFactorSecret',
        'isTwoFactorEnabled'
      ]
    })

    return user
  }

  // ************************ //
  // findOneByIdWithAuthInfos //
  // ************************ //

  async findOneByFortyTwoIdWithAuthInfos(fortyTwoId: string): Promise<User> {
    if (!fortyTwoId) {
      return null
    }

    const user = await this.userRepository.findOne({
      where: { fortyTwoId },
      select: [
        'id',
        'fortyTwoId',
        'username',
        'password',
        'twoFactorSecret',
        'isTwoFactorEnabled'
      ]
    })

    return user
  }

  // ************************ //
  // findOneByIdWithAuthInfos //
  // ************************ //

  async findOneByIdWithAuthInfos(id: string): Promise<User> {
    if (!id) {
      return null
    }

    const user = await this.userRepository.findOne({
      where: { id },
      select: [
        'id',
        'username',
        'password',
        'twoFactorSecret',
        'isTwoFactorEnabled'
      ]
    })

    return user
  }

  // ******************** //
  // findOneByIdWithStats //
  // ******************** //

  async findOneByIdWithStats(id: string): Promise<User> {
    if (!id) {
      return null
    }
    const user = await this.userRepository.findOne({
      where: { id },
      select: [
        'id',
        'username',
        'status',
        'profilePicture',
        'gamesPlayed',
        'win',
        'loss',
        'winRate',
        'pointsScored',
        'pointsConceded',
        'pointsDifference'
      ]
    })

    if (user)
      user.nFriends = await this.friendshipRepository.count({
        where: [
          { sender: { id }, status: FriendshipStatus.ACCEPTED },
          { receiver: { id }, status: FriendshipStatus.ACCEPTED }
        ]
      })

    return user
  }

  // *********** //
  // findOneById //
  // *********** //

  async findOneById(id: string): Promise<User> {
    if (!id) {
      return null
    }
    const user = await this.userRepository.findOneBy({
      id
    })
    if (user) {
      user.nFriends = await this.friendshipRepository.count({
        where: [
          { sender: { id }, status: FriendshipStatus.ACCEPTED },
          { receiver: { id }, status: FriendshipStatus.ACCEPTED }
        ]
      })
    }
    return user
  }

  // *********************** //
  // findOneByIdWithChannels //
  // *********************** //

  async findOneByIdWithChannels(id: string): Promise<User> {
    if (!id) {
      return null
    }

    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'username', 'channels', 'bannedChannels', 'messages'],
      relations: ['channels', 'bannedChannels']
    })

    return user
  }

  // ****** //
  // remove //
  // ****** //

  async remove(id: string): Promise<User> {
    const user = await this.findOneById(id)
    if (!user) {
      throw new UserNotFound()
    }
    return await this.userRepository.remove(user)
  }

  // ****** //
  // update //
  // ****** //

  async update(id: string, attrs: Partial<User>): Promise<User> {
    const user = await this.findOneById(id)
    if (!user) {
      throw new UserNotFound()
    }
    Object.assign(user, attrs)
    return await this.userRepository.save(user)
  }

  // ***************** //
  // updateUserChannel //
  // ***************** //

  async updateUserChannel(id: string, channel: Channel): Promise<User> {
    const user = await this.userRepository.preload({
      id,
      channels: [] as Channel[]
    })

    if (!user) {
      throw new UserNotFound()
    }

    const isBanned = user.bannedChannels?.find(
      (bannedChannel) => bannedChannel.id === channel?.id
    )

    if (isBanned) {
      throw new UserNotInChannel()
    }

    return await this.userRepository.save(user)
  }

  // ******** //
  // SaveFile //
  // ******** //

  async saveFile(file: Express.Multer.File): Promise<string> {
    const filename = randomUUID() + path.extname(file.originalname)
    const filePath = path.join(this.configService.get('UPLOAD_DIR'), filename)
    await fs.promises.writeFile(filePath, file.buffer)

    return filePath
  }

  // ********** //
  // DeleteFile //
  // ********** //

  async deleteFile(filePath: string) {
    try {
      await fs.promises.unlink(filePath)
    } catch (error) {
      throw new BadRequestException('Invalid file path')
    }
    return
  }

  async disconnectAll() {
    await this.userRepository.update({}, { status: 'offline' })
  }
}
