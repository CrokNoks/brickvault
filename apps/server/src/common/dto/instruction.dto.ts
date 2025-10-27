import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateInstructionDto {
  @IsString()
  set_id: string;

  @IsArray()
  steps: any[];

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  file_url?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  uploader_id?: string;
}
