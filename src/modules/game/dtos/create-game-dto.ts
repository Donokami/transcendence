import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '@/modules/users/user.entity';

export class CreateGameDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  owner?: User;

  @ApiProperty()
  @IsBoolean()
  isPrivate: boolean;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  users?: User[];

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  maxMembers?: number;
}
