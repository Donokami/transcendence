import { IsString } from 'class-validator';

export class JoinChannelDto {
  @IsString()
  channelId: string;
}
