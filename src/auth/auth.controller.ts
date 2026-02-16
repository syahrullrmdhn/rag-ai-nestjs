import { Body, Controller, Get, Post, Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('register')
  register(@Body() body: any) {
    return this.auth.register(body?.email, body?.password);
  }

  @Post('login')
  login(@Body() body: any) {
    return this.auth.login(body?.email, body?.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: any) {
    const userId = req.user?.sub ?? req.user?.id ?? req.user?.userId;
    if (!userId) throw new UnauthorizedException('Missing user in request');
    return this.auth.me(userId);
  }

  @Post('logout')
  logout() {
    return this.auth.logout();
  }
}
