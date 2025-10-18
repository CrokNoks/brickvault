import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class InventoryService {
  constructor(
    @InjectModel('Inventory') private readonly inventoryModel: Model<any>,
  ) {}
  // Ajoute ici la logique métier si besoin
}
