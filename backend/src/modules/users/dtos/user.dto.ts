import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'

import { Channel } from '@/modules/chat/channels/entities/channel.entity'
import { type Friendship } from '@/modules/social/entities/friendship.entity'
import { type Message } from '@/modules/chat/channels/entities/message.entity'
import { type User } from '@/modules/users/user.entity'

export class UserDto {
  @ApiProperty()
  @Expose()
  id: string

  @ApiProperty()
  @Expose()
  fortyTwoId: string

  @ApiProperty()
  @Expose()
  username: string

  @ApiProperty()
  @Expose()
  profilePicture: string

  @ApiProperty()
  @Expose()
  isTwoFactorEnabled: string

  @ApiProperty()
  dataUrl?: string

  @ApiProperty()
  @Expose()
  status: string

  @ApiProperty()
  @Expose()
  nFriends: number

  @ApiProperty()
  friends: User[]

  @ApiProperty()
  blockedUser: User[]

  @ApiProperty()
  sentRequests: Friendship[]

  @ApiProperty()
  receivedRequests: Friendship[]

  @ApiProperty()
  channel: Channel

  @ApiProperty()
  bannedChannels: Channel[]

  @ApiProperty()
  messages: Message[]

  @ApiProperty()
  @Expose()
  gamesPlayed: number

  @ApiProperty()
  @Expose()
  win: number

  @ApiProperty()
  @Expose()
  loss: number

  @ApiProperty()
  @Expose()
  winRate: number

  @ApiProperty()
  @Expose()
  pointsScored: number

  @ApiProperty()
  @Expose()
  pointsConceded: number
}
