import { IsOptional, IsString } from 'class-validator'

export class MessageDto {
  @IsString()
  messageBody: string

  @IsString()
  @IsOptional()
  channelId: string

  @IsString()
  userId: string
}
