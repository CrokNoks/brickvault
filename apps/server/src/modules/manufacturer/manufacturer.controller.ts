import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CreateManufacturerDto } from '../../common/dto/manufacturer.dto';
import { ManufacturerService } from './manufacturer.service';

@Controller('api/v1/manufacturers')
export class ManufacturerController {
  constructor(private readonly service: ManufacturerService) {}

  @Get()
  async findAll(
    @Query('country') country?: string,
    @Query('sort') sort: string = 'created_at',
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.service.findAll({
      country,
      sort,
      page: pageNum,
      limit: limitNum,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Query('populate') populate?: string) {
    const manufacturer = await this.service.findOne(id, populate);
    if (!manufacturer) {
      throw new NotFoundException('Manufacturer not found');
    }
    return manufacturer;
  }

  @Post()
  async create(@Body() dto: CreateManufacturerDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: CreateManufacturerDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(200)
  async delete(@Param('id') id: string) {
    const deleted = await this.service.delete(id);
    if (!deleted) {
      throw new NotFoundException('Manufacturer not found');
    }
    return deleted;
  }

  @Patch(':id')
  async patch(
    @Param('id') id: string,
    @Body() dto: Partial<CreateManufacturerDto>,
  ) {
    return this.service.update(id, dto);
  }
}
