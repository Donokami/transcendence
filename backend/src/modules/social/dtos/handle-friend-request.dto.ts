import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class HandleFriendRequestDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  senderId: string
}
