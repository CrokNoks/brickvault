import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { InstructionSchema } from '../../common/entities/instruction.schema';
import { InstructionsController } from './instructions.controller';
import { InstructionsService } from './instructions.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Instruction', schema: InstructionSchema },
    ]),
  ],
  controllers: [InstructionsController],
  providers: [InstructionsService],
})
export class InstructionsModule {}
