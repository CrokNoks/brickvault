import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MarketplaceLinkSchema } from '../../common/entities/marketplace-link.schema';
import { MarketplaceController } from './marketplace.controller';
import { MarketplaceService } from './marketplace.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'MarketplaceLink', schema: MarketplaceLinkSchema },
    ]),
  ],
  controllers: [MarketplaceController],
  providers: [MarketplaceService],
})
export class MarketplaceModule { }
