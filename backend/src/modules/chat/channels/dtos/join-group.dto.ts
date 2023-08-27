import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString, Length } from 'class-validator'

export class JoinGroupDto {
  @ApiProperty()
  @IsString()
  @Length(4, 50)
  channelName: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  @Length(4, 50)
  password?: string
}
