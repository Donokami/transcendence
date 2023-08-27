import { IsString, Length } from 'class-validator'

import { ApiProperty } from '@nestjs/swagger'

export class UpdateChannelDto {
  @ApiProperty()
  @IsString()
  @Length(4, 50)
  readonly name: string
}
