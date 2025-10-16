import { IsOptional, IsString } from 'class-validator';

export class CreateManufacturerDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsString({ message: 'The website field must be a valid URL' })
  website?: string;
}
