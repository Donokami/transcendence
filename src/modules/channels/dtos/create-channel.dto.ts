import { IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

import { User } from '@/modules/users/user.entity';

export class CreateChannelDto {
  @ApiProperty()
  @IsString()
  readonly name: string;

  @ApiProperty()
  owner: User;
}
