import { IsBoolean, IsOptional, IsNotEmpty } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateGameDto {
  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  @IsOptional()
  isPrivate?: boolean
}
