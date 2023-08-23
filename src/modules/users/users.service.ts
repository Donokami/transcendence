import { randomUUID } from 'crypto'
import * as fs from 'fs'
import {
  FilterOperator,
  FilterSuffix,
  PaginateQuery,
  paginate,
  Paginated
} from 'nestjs-paginate'
import * as path from 'path'
import { Subject } from 'rxjs'
import { In, MoreThan, Repository } from 'typeorm'
import { Injectable, Logger, BadRequestException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'

import { UserNotFound, UserNotInChannel } from '@/core/exceptions'
import { type IUserDetails } from '@/core/types/user-details'
import { type Channel } from '@/modules/chat/channels/entities/channel.entity'
import {
  Friendship,
  FriendshipStatus
} from '@/modules/social/entities/friendship.entity'
import { User } from '@/modules/users/user.entity'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Friendship)
    private readonly friendshipRepository: Repository<Friendship>,
    private readonly configService: ConfigService
  ) {}

  private logger: Logger = new Logger(UsersService.name)
  private shutdownListener$: Subject<void> = new Subject()

  // onModuleDestroy() {
  //   this.logger.log('Shutting down...')
  // }

  // subscribeToShutdown(shutdownFn: () => void): void {
  //   this.shutdownListener$.subscribe(() => shutdownFn())
  // }

  // shutdown() {
  //   this.shutdownListener$.next()
  // }

  async create(username: string, password: string): Promise<User> {
    const user = this.usersRepository.create({ password, username })
    return await this.usersRepository.save(user)
  }

  createOauth(details: IUserDetails) {
    const user = this.usersRepository.create(details)
    return this.usersRepository.save(user)
  }

  async deleteFile(filePath: string) {
    try {
      await fs.promises.unlink(filePath)
    } catch (error) {
      throw new BadRequestException('Invalid file path')
    }
    return
  }

  async disconnectAll() {
    await this.usersRepository.update({}, { status: 'offline' })
  }

  async findAll(query: PaginateQuery): Promise<Paginated<User>> {
    return paginate(query, this.usersRepository, {
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

  async findAllWithStats(query: PaginateQuery): Promise<Paginated<User>> {
    return paginate(query, this.usersRepository, {
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

  async findByIds(userIds: string[]): Promise<User[]> {
    return this.usersRepository.find({
      where: {
        id: In(userIds)
      }
    })
  }

  async findOneByUsername(username: string): Promise<User> {
    if (!username) {
      return null
    }

    const user = await this.usersRepository.findOne({ where: { username } })

    return user
  }

  async findOneByUsernameWithAuthInfos(username: string): Promise<User> {
    if (!username) {
      return null
    }

    const user = await this.usersRepository.findOne({
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

  async findOneByFortyTwoIdWithAuthInfos(fortyTwoId: string): Promise<User> {
    if (!fortyTwoId) {
      return null
    }

    const user = await this.usersRepository.findOne({
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

  async findOneById(id: string): Promise<User> {
    if (!id) {
      return null
    }
    const user = await this.usersRepository.findOneBy({
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

  async findOneByIdWithAuthInfos(id: string): Promise<User> {
    if (!id) {
      return null
    }

    const user = await this.usersRepository.findOne({
      where: { id },
      select: ['id', 'username', 'twoFactorSecret', 'isTwoFactorEnabled']
    })

    return user
  }

  async findOneByIdWithChannels(id: string): Promise<User> {
    if (!id) {
      return null
    }

    const user = await this.usersRepository.findOne({
      where: { id },
      select: ['id', 'username', 'channels', 'bannedChannels', 'messages'],
      relations: ['channels', 'bannedChannels']
    })

    return user
  }

  async findOneByIdWithStats(id: string): Promise<User> {
    if (!id) {
      return null
    }
    const user = await this.usersRepository.findOne({
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

  async getUserRankByWinRate(userId: string): Promise<number> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: ['id', 'winRate'],
      order: { winRate: 'DESC' }
    })

    if (!user) {
      throw new UserNotFound()
    }

    const usersWithHigherWinRate = await this.usersRepository.count({
      where: {
        winRate: MoreThan(user.winRate)
      }
    })

    const userRank = usersWithHigherWinRate + 1
    return userRank
  }

  async remove(id: string): Promise<User> {
    const user = await this.findOneById(id)
    if (!user) {
      throw new UserNotFound()
    }
    return await this.usersRepository.remove(user)
  }

  async saveFile(file: Express.Multer.File): Promise<string> {
    const filename = randomUUID() + path.extname(file.originalname)
    const filePath = path.join(this.configService.get('UPLOAD_DIR'), filename)
    await fs.promises.writeFile(filePath, file.buffer)

    return filePath
  }

  async update(id: string, attrs: Partial<User>): Promise<User> {
    const user = await this.findOneById(id)
    if (!user) {
      throw new UserNotFound()
    }
    Object.assign(user, attrs)
    return await this.usersRepository.save(user)
  }

  async updateUserChannel(id: string, channel: Channel): Promise<User> {
    const user = await this.usersRepository.preload({
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

    return await this.usersRepository.save(user)
  }
}
