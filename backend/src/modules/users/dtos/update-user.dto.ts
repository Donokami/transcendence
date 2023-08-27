import { IsString, IsOptional, Length } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class UpdateUserDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  @Length(4, 50)
  username: string

  @ApiProperty()
  @IsString()
  @IsOptional()
  @Length(4, 50)
  password: string
}
