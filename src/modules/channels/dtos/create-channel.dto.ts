import { IsString, IsNumber } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateChannelDto {
  @ApiProperty()
  @IsString()
  readonly name: string;

  @ApiProperty()
  @IsNumber()
  ownerId: string;
}
