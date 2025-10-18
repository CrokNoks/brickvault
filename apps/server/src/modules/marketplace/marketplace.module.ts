import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { MarketplaceLinkSchema } from '../../common/entities/marketplace-link.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MarketplaceController } from './marketplace.controller';
import { MarketplaceService } from './marketplace.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'MarketplaceLink', schema: MarketplaceLinkSchema },
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'changeme',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [MarketplaceController],
  providers: [MarketplaceService, JwtAuthGuard],
})
export class MarketplaceModule { }
