import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateInventoryDto {
  @IsString()
  user_id: string;

  @IsOptional()
  @IsString()
  set_id?: string;

  @IsOptional()
  @IsString()
  piece_id?: string;

  @IsOptional()
  @IsInt()
  quantity?: number;
}
