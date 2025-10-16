import { IsInt, IsMongoId, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateSetDto {
  @IsMongoId()
  manufacturer: string;

  @IsString()
  manufacturer_reference: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsInt()
  year?: number;

  @IsOptional()
  @IsString()
  theme?: string;

  @IsOptional()
  @IsInt()
  piece_count?: number;

  @IsOptional()
  @IsUrl()
  image_url?: string;
}
