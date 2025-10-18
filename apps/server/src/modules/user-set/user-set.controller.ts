import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserSetService } from './user-set.service';

@UseGuards(JwtAuthGuard)
@Controller('api/v1/user-sets')
export class UserSetController {
  constructor(private readonly userSetService: UserSetService) {}

  @Post()
  async assignSet(
    @Req() req,
    @Body('setRef') setRef: string,
    @Body('quantity') quantity = 1,
  ) {
    return this.userSetService.assignSetToUser(req.user.sub, setRef, quantity);
  }

  @Get()
  async getUserSets(@Req() req) {
    return this.userSetService.getUserSets(req.user.sub);
  }

  @Delete(':setRef')
  async removeSet(@Req() req, @Param('setRef') setRef: string) {
    return this.userSetService.removeSetFromUser(req.user.sub, setRef);
  }
}
