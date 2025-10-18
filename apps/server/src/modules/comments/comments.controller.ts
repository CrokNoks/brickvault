import {
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
import { CreateCommentDto } from '../../common/dto/comment.dto';
import { Comment } from '../../common/entities/comment.type';

@Controller('api/v1/comments')
export class CommentsController {
  constructor(
    @InjectModel('Comment') private readonly commentModel: Model<Comment>,
  ) {}

  @Get()
  async findAll(
    @Query('target_type') target_type?: string,
    @Query('target_id') target_id?: string,
    @Query('page') page: string | number = 1,
    @Query('limit') limit: string | number = 20,
    @Query('sort') sort: string = 'created_at',
  ): Promise<{
    items: Comment[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> {
    const filter: FilterQuery<Comment> = {};
    if (target_type) filter.target_type = target_type;
    if (target_id) filter.target_id = target_id;

    const pageNum = typeof page === 'string' ? parseInt(page, 10) : page;
    const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : limit;
    const skip = (pageNum - 1) * limitNum;
    const sortObj: SortObj = { [sort]: -1 };

    const items = await this.commentModel
      .find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum);
    const total = await this.commentModel.countDocuments(filter);

    return {
      items,
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    };
  }

  @Post()
  async create(@Body() dto: CreateCommentDto) {
    return this.commentModel.create(dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.commentModel.findByIdAndDelete(id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Comment | null> {
    return this.commentModel.findById(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateCommentDto>,
  ): Promise<Comment | null> {
    return this.commentModel.findByIdAndUpdate(id, dto, { new: true });
  }
}
