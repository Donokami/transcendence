import {
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsUUID,
  IsOptional,
  IsString,
  ValidateIf,
  IsEnum,
  Length
} from 'class-validator'

import { ApiProperty } from '@nestjs/swagger'
import { ChannelTypes } from '../entities/channel.entity'

export class CreateChannelDto {
  @ApiProperty()
  @IsString()
  @Length(4, 50)
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
  @Length(4, 50)
  password?: string
}
