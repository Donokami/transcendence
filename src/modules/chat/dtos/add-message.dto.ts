import { IsString } from 'class-validator';

export class AddMessageDto {
  @IsString()
  messageBody: string;

  @IsString()
  channelId: string;

  @IsString()
  userId: string;
}
