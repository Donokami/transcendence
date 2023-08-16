import { ApiProperty } from '@nestjs/swagger'
import { IsString, Length } from 'class-validator'

export class GetGroupByNameDto {
  @ApiProperty()
  @IsString()
  @Length(4, 50)
  channelName: string
}
