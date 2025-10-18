import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { InstructionSchema } from '../../common/entities/instruction.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InstructionsController } from './instructions.controller';
import { InstructionsService } from './instructions.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Instruction', schema: InstructionSchema },
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'changeme',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [InstructionsController],
  providers: [InstructionsService, JwtAuthGuard],
})
export class InstructionsModule { }
