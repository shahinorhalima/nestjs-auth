import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(createAuthDto: CreateAuthDto, res: any) {
    const { email, password } = createAuthDto;

    const userEmail = await this.prisma.user.findFirst({ where: { email } });
    if (!userEmail) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // hash match

    const userPass = await bcrypt.compare(password, userEmail.password);

    if (!userPass) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // cretae a jwt token for auth

    const token = await this.jwtService.sign({ ...userEmail });

    // // send any data to cookie
    res.cookie('accessToken', token);

    return {
      message: 'Login successful',
      user: userEmail,
      token: token,
    };
  }
}
