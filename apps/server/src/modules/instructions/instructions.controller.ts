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
import { CreateInstructionDto } from '../../common/dto/instruction.dto';
import { Instruction } from '../../common/entities/instruction.type';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles, RolesGuard } from '../auth/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1/instructions')
export class InstructionsController {
  constructor(
    @InjectModel('Instruction')
    private readonly instructionModel: Model<Instruction>,
  ) { }

  @Get()
  @Roles('user')
  async findAll(
    @Query('set_id') set_id?: string,
    @Query('uploader_id') uploader_id?: string,
    @Query('page') page: string | number = 1,
    @Query('limit') limit: string | number = 20,
    @Query('sort') sort: string = 'created_at',
  ): Promise<{
    items: Instruction[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> {
    const filter: FilterQuery<Instruction> = {};
    if (set_id) filter.set_id = set_id;
    if (uploader_id) filter.uploader_id = uploader_id;

    const pageNum = typeof page === 'string' ? parseInt(page, 10) : page;
    const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : limit;
    const skip = (pageNum - 1) * limitNum;
    const sortObj: SortObj = { [sort]: -1 };

    const items = await this.instructionModel
      .find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum);
    const total = await this.instructionModel.countDocuments(filter);

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
  async findOne(@Param('id') id: string): Promise<Instruction | null> {
    return this.instructionModel.findById(id);
  }

  @Post()
  @Roles('user')
  async create(@Body() dto: CreateInstructionDto) {
    return this.instructionModel.create(dto);
  }

  @Put(':id')
  @Roles('user')
  async update(@Param('id') id: string, @Body() dto: CreateInstructionDto) {
    return this.instructionModel.findByIdAndUpdate(id, dto, { new: true });
  }

  @Delete(':id')
  @Roles('user')
  async delete(@Param('id') id: string) {
    return this.instructionModel.findByIdAndDelete(id);
  }
}
