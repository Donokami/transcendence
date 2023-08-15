import {
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsUUID,
  IsOptional,
  IsString,
  ValidateIf,
  IsEnum
} from 'class-validator'

import { ApiProperty } from '@nestjs/swagger'
import { ChannelTypes } from '../entities/channel.entity'

export class CreateChannelDto {
  @ApiProperty()
  @IsString()
  @ValidateIf((o) => o.type !== ChannelTypes.DM)
  name?: string

  @ApiProperty({
    default: ChannelTypes.PUBLIC
  })
  @IsEnum(ChannelTypes)
  type: ChannelTypes

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
