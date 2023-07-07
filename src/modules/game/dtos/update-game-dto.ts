import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '@/modules/users/user.entity';

export class UpdateGameDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  owner?: User;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  users?: User[];

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  maxMembers?: number;
}
