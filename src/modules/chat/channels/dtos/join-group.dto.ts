import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'

export class JoinGroupDto {
  @ApiProperty()
  @IsString()
  channelName: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  password?: string
}
