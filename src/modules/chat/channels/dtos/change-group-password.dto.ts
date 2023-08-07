import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsUUID } from 'class-validator'

export class ChangeGroupPasswordDto {
  @ApiProperty()
  @IsUUID('4')
  userId: string

  // todo: check what we want as a group password policy
  @ApiProperty()
  @IsString()
  // @Length(8, 50)
  newPassword: string
}
