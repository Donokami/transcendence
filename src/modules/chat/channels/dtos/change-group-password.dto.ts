import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsUUID, Length } from 'class-validator'

export class ChangeGroupPasswordDto {
  @ApiProperty()
  @IsUUID('4')
  userId: string

  @ApiProperty()
  @IsString()
  @Length(4, 50)
  newPassword: string
}
