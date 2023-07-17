import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator'

import { ApiProperty } from '@nestjs/swagger'

export class CreateChannelDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  name?: string

  @ApiProperty()
  @IsBoolean()
  isDm: boolean

  @ApiProperty()
  @IsString()
  ownerId: string

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  membersIds: Array<string>

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  passwordRequired?: boolean

  @ApiProperty()
  @IsOptional()
  @IsString()
  password?: string
}
