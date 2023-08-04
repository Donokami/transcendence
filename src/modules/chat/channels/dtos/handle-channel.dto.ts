import { ApiProperty } from '@nestjs/swagger'
import { IsUUID } from 'class-validator'

export class HandleChannelDto {
  @ApiProperty()
  @IsUUID('4')
  userId: string
}
