import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { CreateMarketplaceLinkDto } from '../../common/dto/marketplace-link.dto';
import { MarketplaceLink } from '../../common/entities/marketplace-link.type';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles, RolesGuard } from '../auth/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1/marketplace')
export class MarketplaceController {
  constructor(
    @InjectModel('MarketplaceLink')
    private readonly marketplaceModel: Model<MarketplaceLink>,
  ) { }

  @Get('prices')
  @Roles('user')
  async getPrices(
    @Query('piece_id') piece_id?: string,
    @Query('supplier') supplier?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('sort') sort: string = 'created_at',
  ): Promise<{
    items: MarketplaceLink[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> {
    const filter: FilterQuery<MarketplaceLink> = {};
    if (piece_id) filter.piece_id = piece_id;
    if (supplier) filter.supplier = supplier;

    const skip = (page - 1) * limit;
    const sortObj: SortObj = { [sort]: -1 };

    const items = await this.marketplaceModel
      .find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(limit);
    const total = await this.marketplaceModel.countDocuments(filter);

    return {
      items,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  @Get()
  @Roles('user')
  async getAll(
    @Query('piece_id') piece_id?: string,
    @Query('supplier') supplier?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sort') sort: string = 'created_at',
  ): Promise<{
    items: MarketplaceLink[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> {
    const filter: FilterQuery<MarketplaceLink> = {};
    if (piece_id) filter.piece_id = piece_id;
    if (supplier) filter.supplier = supplier;

    // Conversion des paramètres page/limit en number
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    const skip = (pageNum - 1) * limitNum;
    const sortObj: Record<string, 1 | -1> = { [sort]: -1 };

    const items = await this.marketplaceModel
      .find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum);
    const total = await this.marketplaceModel.countDocuments(filter);

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
  async create(@Body() dto: CreateMarketplaceLinkDto) {
    return this.marketplaceModel.create(dto);
  }

  @Put(':id')
  @Roles('user')
  async update(@Param('id') id: string, @Body() dto: CreateMarketplaceLinkDto) {
    return this.marketplaceModel.findByIdAndUpdate(id, dto, { new: true });
  }

  @Delete(':id')
  @Roles('user')
  async delete(@Param('id') id: string) {
    return this.marketplaceModel.findByIdAndDelete(id);
  }

  @Get(':id')
  @Roles('user')
  async getOne(@Param('id') id: string): Promise<MarketplaceLink | null> {
    return this.marketplaceModel.findById(id);
  }
}
