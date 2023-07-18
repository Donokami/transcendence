import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { User } from '@/modules/users/user.entity'

export class CreateGameDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  name: string

  @ApiProperty()
  @IsString()
  @IsOptional()
  owner: User // todo: change to string

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isPrivate: boolean

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  users: User[] // todo: change to string[]

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  maxMembers: number
}
