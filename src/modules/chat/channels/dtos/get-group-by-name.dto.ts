import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class GetGroupByNameDto {
  @ApiProperty()
  @IsString()
  channelName: string
}
