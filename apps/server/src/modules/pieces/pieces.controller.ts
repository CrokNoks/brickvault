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
import { CreatePieceDto } from '../../common/dto/piece.dto';
import { Piece } from '../../common/entities/piece.type';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles, RolesGuard } from '../auth/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1/pieces')
export class PiecesController {
  constructor(
    @InjectModel('Piece') private readonly pieceModel: Model<Piece>,
  ) { }

  @Get()
  @Roles('user')
  async findAll(
    @Query('name') name?: string,
    @Query('color') color?: string,
    @Query('reference') reference?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sort') sort: string = 'created_at',
  ): Promise<{
    items: Piece[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> {
    const filter: FilterQuery<Piece> = {};
    if (name) filter.name = { $regex: name, $options: 'i' };
    if (color) filter.color = color;
    if (reference) filter.ref = reference;

    // Conversion explicite des paramètres page/limit en number
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    const skip = (pageNum - 1) * limitNum;
    const sortObj: Record<string, 1 | -1> = { [sort]: -1 };

    const items = await this.pieceModel
      .find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum);
    const total = await this.pieceModel.countDocuments(filter);

    return {
      items,
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    };
  }

  @Get(':id')
  @Roles('user')
  async findOne(@Param('id') id: string): Promise<Piece | null> {
    return this.pieceModel.findById(id);
  }

  @Post()
  @Roles('user')
  async create(@Body() dto: CreatePieceDto) {
    return this.pieceModel.create(dto);
  }

  @Put(':id')
  @Roles('user')
  async update(@Param('id') id: string, @Body() dto: CreatePieceDto) {
    return this.pieceModel.findByIdAndUpdate(id, dto, { new: true });
  }

  @Delete(':id')
  @Roles('admin')
  async delete(@Param('id') id: string) {
    return this.pieceModel.findByIdAndDelete(id);
  }
}
