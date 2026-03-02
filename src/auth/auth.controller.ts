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

  @Post('register')
  async register(
    @Body() dto: CreateAuthDto,
    @Res({ passthrough: true }) res: any,
  ) {
    const user = this.authService.register(dto, res);
    return res.json(user);
  }

  @Post('login')
  async login(
    @Body() createAuthDto: CreateAuthDto,
    @Res({ passthrough: true }) res: any,
  ) {
    const result = await this.authService.login(createAuthDto, res);
    return res.json(result);
  }

  @Post('refresh')
  async refresh(@Body() body: { refreshToken: string }, @Res() res: any) {
    const result = await this.authService.refreshAccessToken(body.refreshToken);
    return res.json(result);
  }

  @Post('logout')
  async logout(@Req() req: any, @Res() res: any) {
    const userId = req.loginUser.id;
    const result = await this.authService.logout(userId);
  }

  @UseGuards(AuthGuard)
  @Get('validate')
  validate(@Res() res, @Req() req) {
    return res.json({ message: 'Token validated' });
  }
}
