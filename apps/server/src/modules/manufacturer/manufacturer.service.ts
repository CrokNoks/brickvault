import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Manufacturer } from '../../common/entities/manufacturer.type';

@Injectable()
export class ManufacturerService {
  constructor(
    @InjectModel('Manufacturer')
    private readonly manufacturerModel: Model<Manufacturer>,
  ) {}

  async create(data: Partial<Manufacturer>): Promise<Manufacturer> {
    // Check name uniqueness
    if (!data.name) {
      throw new BadRequestException('The "name" field is required');
    }
    const existing = await this.manufacturerModel.findOne({ name: data.name });
    if (existing) {
      throw new BadRequestException(
        'A manufacturer with this name already exists',
      );
    }
    return this.manufacturerModel.create(data);
  }

  async findAll(
    options: {
      country?: string;
      sort: string;
      page?: number;
      limit?: number;
    } = { sort: 'created_at' },
  ): Promise<{ items: Manufacturer[]; page: number; limit: number }> {
    const pageNum = options?.page ?? 1;
    const limitNum = options?.limit ?? 10;
    const query: FilterQuery<Manufacturer> = {};
    if (options?.country) query.country = options.country;
    const sortObj: SortObj = { [options.sort]: 1 };
    const items = await this.manufacturerModel
      .find(query)
      .sort(sortObj)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .exec();
    return {
      items,
      page: pageNum,
      limit: limitNum,
    };
  }

  async findOne(id: string, populate?: string): Promise<Manufacturer | null> {
    const manufacturer = await this.manufacturerModel.findById(id);
    if (!manufacturer) return null;
    if (populate === 'sets') {
      // Population manuelle des sets liés
      const SetModel = this.manufacturerModel.db.model('Set');
      const sets = await SetModel.find({ manufacturer: manufacturer._id });
      // On retourne le manufacturer avec le champ sets peuplé
      const manufacturerObj = manufacturer.toObject();
      return {
        ...manufacturerObj,
        sets,
      };
    }
    return manufacturer;
  }

  async update(
    id: string,
    data: Partial<Manufacturer>,
  ): Promise<Manufacturer | null> {
    return this.manufacturerModel.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string): Promise<Manufacturer | null> {
    return this.manufacturerModel.findByIdAndDelete(id);
  }
}
