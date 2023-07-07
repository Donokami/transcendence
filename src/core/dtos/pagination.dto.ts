import { IsOptional, IsString } from 'class-validator';

export class PaginationDTO {
  @IsString()
  @IsOptional()
  limit?: string;

  @IsString()
  @IsOptional()
  page?: string;
}
