import { IsString, Length } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class SetUsernameDto {
  @ApiProperty()
  @IsString()
  @Length(3, 100)
  username: string
}
