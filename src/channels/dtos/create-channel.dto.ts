import { IsString, IsNumber } from 'class-validator';

export class CreateChannelDto {
  @IsString()
  readonly name: string;

  @IsNumber()
  ownerId: string;
}
