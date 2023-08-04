import { Transform } from 'class-transformer'
import { IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { Channel } from '../entities/channel.entity'
import { ApiProperty } from '@nestjs/swagger'

export class MessageDto {
  @ApiProperty()
  @IsString()
  messageBody: string

  @ApiProperty()
  @IsString()
  @IsOptional()
  channel: Channel

  @ApiProperty()
  @IsNotEmpty()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  date: Date
}
