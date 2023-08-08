import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class HandleBlockDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  targetId: string
}
