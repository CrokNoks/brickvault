import { IsString } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  user_id: string;

  @IsString()
  target_type: 'set' | 'instruction';

  @IsString()
  target_id: string;

  @IsString()
  content: string;
}
