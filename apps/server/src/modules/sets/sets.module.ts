import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { JwtModule } from '@nestjs/jwt';
import { SetSchema } from '../../common/entities/set.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SetsController } from './sets.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Set', schema: SetSchema }]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'changeme',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [SetsController],
  providers: [JwtAuthGuard],
})
export class SetsModule { }
