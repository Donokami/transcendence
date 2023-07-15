import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import { Channel } from '@/modules/channels/entities/channel.entity';
import { type Friendship } from '@/modules/social/entities/friendship.entity';
import { type Message } from '@/modules/channels/entities/message.entity';
import { type User } from '@/modules/users/user.entity';

export class UserDto {
  // ******************* //
  // USER AUTHENTICATION //
  // ******************* //

  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  username: string;

  @ApiProperty()
  @Expose()
  email: string;

  @ApiProperty()
  @Expose()
  profilePicture: string;

  @ApiProperty()
  @Expose()
  isTwoFactorEnabled: string;

  @ApiProperty()
  @Expose()
  dataUrl?: string;

  // ****************** //
  // OTHER INFORMATIONS //
  // ****************** //

  @ApiProperty()
  @Expose()
  status: string;

  // ******************************* //
  // FRIENDSHIP RELATED INFORMATIONS //
  // ******************************* //

  @ApiProperty()
  @Expose()
  nFriends: number;

  @ApiProperty()
  @Expose()
  friends: User[];

  @Expose()
  @Expose()
  blockedUser: User[];

  @ApiProperty()
  @Expose()
  sentRequests: Friendship[];

  @ApiProperty()
  @Expose()
  receivedRequests: Friendship[];

  // ************************* //
  // CHAT RELATED INFORMATIONS //
  // ************************* //

  @ApiProperty()
  @Expose()
  channel: Channel;

  @ApiProperty()
  @Expose()
  bannedChannels: Channel[];

  @ApiProperty()
  @Expose()
  messages: Message[];

  // ************************** //
  // STATS RELATED INFORMATIONS //
  // ************************** //

  @ApiProperty()
  @Expose()
  rank: number;

  @ApiProperty()
  @Expose()
  gamesPlayed: number;

  @ApiProperty()
  @Expose()
  win: number;

  @ApiProperty()
  @Expose()
  loss: number;

  @ApiProperty()
  @Expose()
  winRate: number;

  @ApiProperty()
  @Expose()
  pointsScored: number;

  @ApiProperty()
  @Expose()
  pointsConceded: number;

  @ApiProperty()
  @Expose()
  pointsDifference: number;
}
