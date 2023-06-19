import { IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class UpdateChannelDto {
  @ApiProperty()
  @IsString()
  readonly name: string;
}
