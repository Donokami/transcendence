import { IsString, Length } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class SetUsernameDto {
  @ApiProperty()
  @IsString()
  @Length(4, 50)
  username: string
}
