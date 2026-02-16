import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private auth: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'dev_secret_change_me',
    });
  }

  async validate(payload: any) {
    // payload standard: { sub, email, iat, exp }
    const sub = payload?.sub;
    if (!sub) throw new UnauthorizedException('Invalid token payload');

    // Optional: if you keep jti logic, keep this (but your AuthService returns false always)
    const revoked = await this.auth.isTokenRevoked(payload?.jti);
    if (revoked) throw new UnauthorizedException('Token revoked');

    // IMPORTANT: return an object that has `sub` so controller can read it
    return { sub, email: payload?.email };
  }
}
