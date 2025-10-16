import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateMarketplaceLinkDto {
  @IsString()
  piece_id: string;

  @IsOptional()
  @IsString()
  supplier?: string;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsString()
  currency?: string;
}
