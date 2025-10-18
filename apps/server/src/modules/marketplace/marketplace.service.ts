import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class MarketplaceService {
  constructor(
    @InjectModel('MarketplaceLink')
    private readonly marketplaceModel: Model<any>,
  ) {}
  // Ajoute ici la logique métier si besoin
}
