import { Controller, Get, Post } from '@nestjs/common';

@Controller('api/v1/auth')
export class AuthController {
  @Post('register')
  register() {
    return { message: 'register' };
  }

  @Post('login')
  login() {
    return { message: 'login' };
  }

  @Get('me')
  getMe() {
    return { message: 'me' };
  }
}
