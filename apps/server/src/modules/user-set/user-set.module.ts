import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSetSchema } from '../../common/entities/user-set.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserSetController } from './user-set.controller';
import { UserSetService } from './user-set.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'UserSet', schema: UserSetSchema }]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'changeme',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [UserSetController],
  providers: [UserSetService, JwtAuthGuard],
  exports: [UserSetService],
})
export class UserSetModule {}
