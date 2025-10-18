import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users';

function isPasswordStrong(password: string): boolean {
  // 8+ chars, min/maj, 1 chiffre, 1 spécial
  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
  return strongPasswordRegex.test(password);
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(
    email: string,
    password: string,
    role: 'user' | 'admin' = 'user',
  ) {
    if (!isPasswordStrong(password)) {
      throw new BadRequestException(
        'Password must be at least 8 characters long, contain upper and lower case letters, a number, and a special character.',
      );
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.usersService.create({
      email,
      password: hashedPassword,
      role,
    });
    return { user };
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { sub: user._id, email: user.email };
    const token = this.jwtService.sign(payload);
    return { access_token: token };
  }

  async getMe(userId: string) {
    return this.usersService.findById(userId);
  }
}
