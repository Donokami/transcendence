import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class FriendRequestDto {
  @IsString()
  @ApiProperty()
  receiverId: string;
}
