import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from './modules/auth/auth.module';
import { CommentsModule } from './modules/comments/comments.module';
import { InstructionsModule } from './modules/instructions/instructions.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { ManufacturerModule } from './modules/manufacturer/manufacturer.module';
import { MarketplaceModule } from './modules/marketplace/marketplace.module';
import { PiecesModule } from './modules/pieces/pieces.module';
import { SetsModule } from './modules/sets/sets.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGO_URI || 'mongodb://localhost:27017/brickvault',
    ),
    AuthModule,
    SetsModule,
    InstructionsModule,
    PiecesModule,
    InventoryModule,
    CommentsModule,
    MarketplaceModule,
    ManufacturerModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
