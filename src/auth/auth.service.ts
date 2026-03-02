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

  async register(dto: CreateAuthDto, res: any) {
    const { name, email, phone, password } = dto;
    //check email exist
    const userEmail = await this.prisma.user.findFirst({ where: { email } });
    if (userEmail) {
      throw new UnauthorizedException('Email already exist');
    }
    // check phone exist
    const userPhone = await this.prisma.user.findFirst({ where: { phone } });
    if (userPhone) {
      throw new UnauthorizedException('phone already exist');
    }

    // hash password
    const hashPassword = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashPassword,
        role: 'USER',
      },
    });
    return {
      message: 'User registered successfully',
      user: user,
    };
  }

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

    // create jwt tokens
    const accessToken = await this.jwtService.sign({ ...userEmail });

    // refresh token create

    const refreshToken = await this.jwtService.sign(
      { sub: userEmail.id }, // শুধু user id দিন
      { expiresIn: '7d' }, // দীর্ঘ expiry time
    );

    // database-এ refresh token save করুন

    await this.prisma.user.update({
      where: { id: userEmail.id },
      data: { refreshToken },
    });

    // send tokens to cookie

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      sameSite: 'none',
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'none',
    });

    return {
      message: 'Login successful',
      user: userEmail,
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }

  async logout(userid: string) {
    // database refresh token remove
    await this.prisma.user.update({
      where: { id: userid },
      data: { refreshToken: null },
    });
    return {
      message: 'Logout successful',
    };
  }

  async refreshAccessToken(refreshAccessToken: string) {
    try {
      // refresh token verify
      const tokenVerif = await this.jwtService.verify(refreshAccessToken);
      // database refresh token macth check
      const user = await this.prisma.user.findFirst({
        where: { id: tokenVerif.sub },
      });

      if (!user || user.refreshToken !== refreshAccessToken) {
        throw new UnauthorizedException('Invalid refresh token');

        // new access token create
        const newToken = await this.jwtService.sign({ ...user });
        return {
          message: 'Token refreshed',
          accessToken: newToken,
        };
      }
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
