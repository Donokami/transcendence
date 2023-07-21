import { Transform, Type } from 'class-transformer'
import { IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class MessageDto {
  @IsString()
  messageBody: string

  @IsString()
  @IsOptional()
  channelId: string

  @IsString()
  userId: string

  @IsNotEmpty()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  date: Date
}
