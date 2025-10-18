import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { JwtModule } from '@nestjs/jwt';
import { PieceSchema } from '../../common/entities/piece.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PiecesController } from './pieces.controller';
import { PiecesService } from './pieces.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Piece', schema: PieceSchema }]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'changeme',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [PiecesController],
  providers: [PiecesService, JwtAuthGuard],
})
export class PiecesModule { }
