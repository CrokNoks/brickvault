import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PieceSchema } from '../../common/entities/piece.schema';
import { PiecesController } from './pieces.controller';
import { PiecesService } from './pieces.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Piece', schema: PieceSchema }]),
  ],
  controllers: [PiecesController],
  providers: [PiecesService],
})
export class PiecesModule { }
