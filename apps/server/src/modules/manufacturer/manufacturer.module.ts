import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ManufacturerSchema } from '../../common/entities/manufacturer.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ManufacturerController } from './manufacturer.controller';
import { ManufacturerService } from './manufacturer.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Manufacturer', schema: ManufacturerSchema },
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'changeme',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [ManufacturerController],
  providers: [ManufacturerService, JwtAuthGuard],
})
export class ManufacturerModule { }
