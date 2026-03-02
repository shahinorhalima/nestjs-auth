import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { name, email, phone, password } = createUserDto;

    const userEmail = await this.prisma.user.findUnique({
      where: { email },
    });

    if (userEmail) {
      throw new UnauthorizedException('Email already exists');
    }

    const userPhone = await this.prisma.user.findUnique({
      where: { phone },
    });
    if (userPhone) {
      throw new UnauthorizedException('Phone number already exists');
    }

    // haspas create

    const hashPass = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashPass,
      },
    });

    return {
      message: 'User cretaed successfully',
      user,
    };
  }

  async findAll() {
    return await this.prisma.user.findMany();
  }

  async findOne(id: string) {
    return await this.prisma.user.findUnique({
      where: {
        id: id,
      },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
