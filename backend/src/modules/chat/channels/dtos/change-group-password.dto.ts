import { ApiProperty } from '@nestjs/swagger'
import { IsString, Length } from 'class-validator'

export class ChangeGroupPasswordDto {
  @ApiProperty()
  @IsString()
  @Length(4, 50)
  newPassword: string
}
