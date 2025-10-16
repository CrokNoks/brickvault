import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { CreateSetDto } from '../../common/dto/set.dto';
import { Set } from '../../common/entities/set.type';

@Controller('api/v1/sets')
export class SetsController {
  constructor(@InjectModel('Set') private readonly setModel: Model<Set>) { }

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('theme') theme?: string,
    @Query('year') year?: number,
    @Query('pieces_min') pieces_min?: number,
    @Query('pieces_max') pieces_max?: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sort') sort: string = 'created_at',
    @Query('manufacturer') manufacturer?: string,
  ): Promise<{
    items: Set[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> {
    const filter: FilterQuery<Set> = {};
    if (search) filter.name = { $regex: search, $options: 'i' };
    if (theme) filter.theme = theme;
    if (year) filter.year = year;
    if (manufacturer) filter.manufacturer = manufacturer;
    if (pieces_min)
      filter.piece_count = { ...filter.piece_count, $gte: pieces_min };
    if (pieces_max)
      filter.piece_count = { ...filter.piece_count, $lte: pieces_max };

    // Conversion explicite des paramètres page/limit en number
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    const skip = (pageNum - 1) * limitNum;
    const sortObj: Record<string, 1 | -1> = { [sort]: -1 };

    const items = await this.setModel
      .find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .populate('manufacturer');
    const total = await this.setModel.countDocuments(filter);

    return {
      items,
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Set | null> {
    return this.setModel.findById(id).populate('manufacturer');
  }

  @Post()
  async create(@Body() dto: CreateSetDto) {
    try {
      const created = await this.setModel.create(dto);
      return this.setModel.findById(created._id).populate('manufacturer');
    } catch (err: any) {
      // Gestion d'erreur unicité
      if (err.code === 11000) {
        throw new BadRequestException(
          'A set with this manufacturer and manufacturer_reference already exists',
        );
      }
      throw err;
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: CreateSetDto) {
    return this.setModel.findByIdAndUpdate(id, dto, { new: true });
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.setModel.findByIdAndDelete(id);
  }
}
