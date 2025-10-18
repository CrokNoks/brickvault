import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class PiecesService {
  constructor(@InjectModel('Piece') private readonly pieceModel: Model<any>) {}
  // Ajoute ici la logique métier si besoin
}
