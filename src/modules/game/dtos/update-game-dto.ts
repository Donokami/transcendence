import { IsBoolean, IsOptional, IsEnum, IsNotEmpty } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class UpdateGameDto {
  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  @IsOptional()
  isPrivate?: boolean

  @ApiProperty()
  @IsEnum([1.5, 3, 6])
  @IsNotEmpty()
  gameDuration?: number

  @ApiProperty()
  @IsEnum([0.8, 1, 1.2])
  @IsNotEmpty()
  ballSpeed?: number

  @ApiProperty()
  @IsEnum([0.1, 0.2, 0.3])
  @IsNotEmpty()
  @IsOptional()
  paddleRatio?: number
}
