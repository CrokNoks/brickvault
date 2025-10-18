import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { CreateInventoryDto } from '../../common/dto/inventory.dto';
import { Inventory } from '../../common/entities/inventory.type';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles, RolesGuard } from '../auth/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1/inventory')
export class InventoryController {
  constructor(
    @InjectModel('Inventory') private readonly inventoryModel: Model<Inventory>,
  ) { }

  @Get()
  @Roles('user')
  async findAll(
    @Query('user_id') user_id?: string,
    @Query('set_id') set_id?: string,
    @Query('piece_id') piece_id?: string,
    @Query('page') page: string | number = 1,
    @Query('limit') limit: string | number = 20,
    @Query('sort') sort: string = 'created_at',
  ): Promise<{
    items: Inventory[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> {
    const filter: FilterQuery<Inventory> = {};
    if (user_id) filter.user_id = user_id;
    if (set_id) filter.set_id = set_id;
    if (piece_id) filter.piece_id = piece_id;

    const pageNum = typeof page === 'string' ? parseInt(page, 10) : page;
    const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : limit;
    const skip = (pageNum - 1) * limitNum;
    const sortObj: SortObj = { [sort]: -1 };

    const items = await this.inventoryModel
      .find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum);
    const total = await this.inventoryModel.countDocuments(filter);

    return {
      items,
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    };
  }

  @Post()
  @Roles('user')
  async create(@Body() dto: CreateInventoryDto) {
    return this.inventoryModel.create(dto);
  }

  @Patch(':id')
  @Roles('user')
  async update(@Param('id') id: string, @Body() dto: CreateInventoryDto) {
    return this.inventoryModel.findByIdAndUpdate(id, dto, { new: true });
  }

  @Put(':id')
  @Roles('user')
  async updatePut(
    @Param('id') id: string,
    @Body() dto: CreateInventoryDto,
  ): Promise<Inventory | null> {
    return this.inventoryModel.findByIdAndUpdate(id, dto, { new: true });
  }

  @Delete(':id')
  @Roles('admin')
  async delete(@Param('id') id: string) {
    return this.inventoryModel.findByIdAndDelete(id);
  }

  @Get(':id')
  @Roles('user')
  async findOne(@Param('id') id: string): Promise<Inventory | null> {
    return this.inventoryModel.findById(id);
  }
}
