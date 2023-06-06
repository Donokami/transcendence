import { IsString } from 'class-validator';

export class KickUserDto {
  @IsString()
  roomId: string;

  @IsString()
  userId: string;

  @IsString()
  reason: string;
}
