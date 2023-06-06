import { IsString } from 'class-validator';

export class UpdateChannelDto {
  @IsString()
  readonly name: string;
}
