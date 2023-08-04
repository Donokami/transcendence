import {
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsUUID,
  IsBoolean,
  IsOptional,
  IsString,
  ValidateIf
} from 'class-validator'

import { ApiProperty } from '@nestjs/swagger'

export class CreateChannelDto {
  @ApiProperty()
  @IsString()
  @ValidateIf((o) => o.isDm === false)
  name?: string

  @ApiProperty()
  @IsBoolean()
  isDm: boolean

  @ApiProperty()
  @IsArray()
  @IsUUID('4', { each: true })
  @ArrayNotEmpty()
  @ArrayMinSize(2)
  membersIds: Array<string>

  @ApiProperty()
  @IsString()
  @IsOptional()
  password?: string
}
