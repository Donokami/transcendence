import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { User } from '@/modules/users/user.entity'

export class UpdateGameDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  name?: string

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean
}
