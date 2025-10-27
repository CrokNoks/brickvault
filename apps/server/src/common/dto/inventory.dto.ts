import { IsOptional, IsString } from 'class-validator';

export class CreateInventoryDto {
  @IsString()
  user_id: string;

  @IsOptional()
  @IsString()
  set_id?: string;

  @IsOptional()
  pieces?: Array<{ piece: string; quantity: number }>;
}
