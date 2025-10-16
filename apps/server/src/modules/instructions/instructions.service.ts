import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class InstructionsService {
  constructor(
    @InjectModel('Instruction') private readonly instructionModel: Model<any>,
  ) { }
  // Ajoute ici la logique métier si besoin
}
