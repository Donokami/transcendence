import { IsString, Length } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class SignInUserDto {
  @ApiProperty()
  @IsString()
  username: string

  @ApiProperty()
  @IsString()
  @Length(4, 50)
  password: string
}
