import { IsOptional, IsString } from 'class-validator';

export class CreatePieceDto {
  @IsString()
  ref: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  image_url?: string;
}
