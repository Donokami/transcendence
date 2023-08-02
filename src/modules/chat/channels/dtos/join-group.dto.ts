import { IsOptional, IsString } from 'class-validator'

export class JoinGroupDto {
  @IsString()
  channelName: string

  @IsOptional()
  @IsString()
  password?: string
}
