import { IsString, Length, IsUUID } from 'class-validator'

export class KickUserDto {
  @IsString()
  channelId: string

  @IsString()
  @IsUUID('4')
  userId: string

  @IsString()
  @Length(0, 255)
  reason: string
}
