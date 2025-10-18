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
import { Roles, RolesGuard } from '../auth/roles.guard';
import { UserSetService } from './user-set.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1/user-sets')
export class UserSetController {
  constructor(private readonly userSetService: UserSetService) { }

  @Post()
  @Roles('user')
  async assignSet(
    @Req() req,
    @Body('setRef') setRef: string,
    @Body('quantity') quantity = 1,
  ) {
    return this.userSetService.assignSetToUser(req.user.sub, setRef, quantity);
  }

  @Get()
  @Roles('user')
  async getUserSets(@Req() req) {
    return this.userSetService.getUserSets(req.user.sub);
  }

  @Delete(':setRef')
  @Roles('user')
  async removeSet(@Req() req, @Param('setRef') setRef: string) {
    return this.userSetService.removeSetFromUser(req.user.sub, setRef);
  }
}
