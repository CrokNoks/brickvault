import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { InventorySchema } from '../../common/entities/inventory.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Inventory', schema: InventorySchema }]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'changeme',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [InventoryController],
  providers: [InventoryService, JwtAuthGuard],
})
export class InventoryModule { }
