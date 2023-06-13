import { IsString } from 'class-validator';

export class KickUserDto {
  @IsString()
  channelId: string;

  @IsString()
  userId: string;

  @IsString()
  reason: string;
}
