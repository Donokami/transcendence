import { IsString, Length } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class RegisterUserDto {
  @ApiProperty()
  @IsString()
  @Length(4, 50)
  username: string

  @ApiProperty()
  @IsString()
  @Length(4, 50)
  password: string
}
