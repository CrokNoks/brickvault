import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SetSchema } from '../../common/entities/set.schema';
import { SetsController } from './sets.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Set', schema: SetSchema }])],
  controllers: [SetsController],
  providers: [],
})
export class SetsModule {}
