import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import { Channel } from '@/modules/channels/entities/channel.entity';
import { Friendship } from '@/modules/social/entities/friendship.entity';
import { Message } from '@/modules/channels/entities/message.entity';
import { User } from '@/modules/users/user.entity';

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
  friends: Array<User>;

  @Expose()
  @Expose()
  blockedUser: Array<User>;

  @ApiProperty()
  @Expose()
  sentRequests: Array<Friendship>;

  @ApiProperty()
  @Expose()
  receivedRequests: Array<Friendship>;

  // ************************* //
  // CHAT RELATED INFORMATIONS //
  // ************************* //

  @ApiProperty()
  @Expose()
  channel: Channel;

  @ApiProperty()
  @Expose()
  bannedChannels: Array<Channel>;

  // @ApiProperty()
  // @Expose()
  // isAdmin: boolean;

  @ApiProperty()
  @Expose()
  messages: Array<Message>;

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
