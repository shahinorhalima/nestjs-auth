import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const token = context.switchToHttp().getRequest().cookies.accessToken;
    const req = context.switchToHttp().getRequest();

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }
    const tokenverify = this.jwtService.verify(token);
    if (!tokenverify) {
      throw new UnauthorizedException('Invalid token');
    }

    const { password, createdAt, updatedAt, iat, exp, ...user } = tokenverify;
    req.loginUser = user;
    return true;
  }
}
