import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
  BadRequestException
} from '@nestjs/common'
import { In, Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import {
  FilterOperator,
  FilterSuffix,
  Paginate,
  PaginateQuery,
  paginate,
  Paginated
} from 'nestjs-paginate'

import { type Channel } from '@/modules/channels/entities/channel.entity'
import { type UserDetails } from '@/core/types/user-details'
import {
  Friendship,
  FriendshipStatus
} from '@/modules/social/entities/friendship.entity'

import { randomUUID } from 'crypto'
import * as path from 'path'
import * as fs from 'fs'

import { User } from './user.entity'
import { UserDto } from './dtos/user.dto'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Friendship)
    private readonly friendshipRepository: Repository<Friendship>
  ) {}

  // ****** //
  // LOGGER //
  // ****** //

  private logger: Logger = new Logger(UsersService.name)

  // ******************** //
  // FUNCTION DEFINITIONS //
  // ******************** //

  // ****** //
  // create //
  // ****** //

  async create(
    email: string,
    password: string,
    username: string
  ): Promise<User> {
    const user = this.userRepository.create({ email, password, username })
    return await this.userRepository.save(user)
  }

  // *********** //
  // createOauth //
  // *********** //

  createOauth(details: UserDetails) {
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
        'rank',
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
        'rank',
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
        rank: [FilterOperator.EQ, FilterSuffix.NOT],
        gamesPlayed: [FilterOperator.EQ, FilterSuffix.NOT],
        win: [FilterOperator.EQ, FilterSuffix.NOT],
        loss: [FilterOperator.EQ, FilterSuffix.NOT],
        winRate: [FilterOperator.EQ, FilterSuffix.NOT],
        pointsScored: [FilterOperator.EQ, FilterSuffix.NOT],
        pointsConceded: [FilterOperator.EQ, FilterSuffix.NOT],
        pointsDifference: [FilterOperator.EQ, FilterSuffix.NOT]
      }
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

  // ************** //
  // findOneByEmail //
  // ************** //

  async findOneByEmail(email: string): Promise<User> {
    if (!email) {
      return null
    }

    const user = await this.userRepository.findOne({ where: { email } })

    return user
  }

  // *************************** //
  // findOneByEmailWithAuthInfos //
  // *************************** //

  async findOneByEmailWithAuthInfos(email: string): Promise<User> {
    if (!email) {
      return null
    }

    const user = await this.userRepository.findOne({
      where: { email },
      select: [
        'id',
        'username',
        'email',
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

  async findOneByIdWithStats(id: string): Promise<User> {
    if (!id) {
      return null
    }
    const user = await this.userRepository.findOne({
      where: { id },
      select: [
        'id',
        'username',
        'rank',
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

  // ****** //
  // remove //
  // ****** //

  async remove(id: string): Promise<User> {
    const user = await this.findOneById(id)
    if (!user) {
      this.logger.warn(`User with ID : ${id} not found`)
      throw new NotFoundException(`User with ID : ${id} not found`)
    }
    return await this.userRepository.remove(user)
  }

  // ****** //
  // update //
  // ****** //

  async update(id: string, attrs: Partial<User>): Promise<User> {
    const user = await this.findOneById(id)
    if (!user) {
      this.logger.warn(`User with ID : ${id} not found`)
      throw new NotFoundException(`User with ID : ${id} not found`)
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
      this.logger.warn(`User with ID : ${id} not found`)
      throw new NotFoundException(`User with ID : ${id} not found`)
    }

    const isBanned = user.bannedChannels?.find(
      (bannedChannel) => bannedChannel.id === channel?.id
    )

    if (isBanned) {
      this.logger.warn(`User with ID : ${id} is banned from this channel`)
      throw new ForbiddenException(
        `User with ID : ${id} is banned from this channel`
      )
    }

    return await this.userRepository.save(user)
  }

  // ******** //
  // SaveFile //
  // ******** //

  async saveFile(file: Express.Multer.File): Promise<string> {
    const filename = randomUUID() + path.extname(file.originalname)
    const filePath = './uploads/' + filename
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
}
