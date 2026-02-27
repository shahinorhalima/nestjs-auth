import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() createAuthDto: CreateAuthDto, @Res() res: any) {
    const result = await this.authService.login(createAuthDto, res);
    return res.json(result);
  }

  @UseGuards(AuthGuard)
  @Get('validate')
  validate(@Res() res, @Req() req) {
    return res.json({ message: 'Token validated' });
  }
}
