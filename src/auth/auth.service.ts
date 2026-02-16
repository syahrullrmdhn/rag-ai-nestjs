import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

type SafeUser = { id: string; email: string };

function isValidEmail(email: string) {
  // pragmatic validation: cukup ketat untuk login app internal
  // - no spaces
  // - must have one @
  // - must have a dot after @
  // - basic allowed chars
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isStrongPassword(pw: string) {
  // minimal: 10 chars + upper + lower + digit + symbol
  if (!pw || pw.length < 10) return false;
  if (!/[a-z]/.test(pw)) return false;
  if (!/[A-Z]/.test(pw)) return false;
  if (!/[0-9]/.test(pw)) return false;
  if (!/[^A-Za-z0-9]/.test(pw)) return false;
  return true;
}

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  private normalizeEmail(email: string) {
    return (email || '').trim().toLowerCase();
  }

  // MVP: token revocation not implemented (logout is client-side remove token)
  async isTokenRevoked(_jti?: string): Promise<boolean> {
    return false;
  }

  async register(email: string, password: string): Promise<SafeUser> {
    const em = this.normalizeEmail(email);

    if (!em) throw new BadRequestException('Email wajib diisi');
    if (!isValidEmail(em)) throw new BadRequestException('Format email tidak valid');

    // kamu sebelumnya cuma min 6; itu terlalu lemah.
    // kalau kamu mau longgar, turunin policy ini.
    if (!isStrongPassword(password)) {
      throw new BadRequestException(
        'Password lemah. Minimal 10 karakter, kombinasi huruf besar, kecil, angka, dan simbol.',
      );
    }

    const exists = await this.prisma.user.findUnique({ where: { email: em } });
    if (exists) throw new BadRequestException('Email sudah terdaftar');

    const hashed = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: { email: em, password: hashed },
      select: { id: true, email: true },
    });

    return user;
  }

  async validateUser(email: string, password: string): Promise<SafeUser> {
    const em = this.normalizeEmail(email);

    // jangan bocorin apakah email invalid atau password salah
    if (!em || !password) throw new UnauthorizedException('Email/password salah');
    if (!isValidEmail(em)) throw new UnauthorizedException('Email/password salah');

    const user = await this.prisma.user.findUnique({
      where: { email: em },
      select: { id: true, email: true, password: true },
    });

    if (!user?.password) throw new UnauthorizedException('Email/password salah');

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new UnauthorizedException('Email/password salah');

    return { id: user.id, email: user.email };
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);

    const payload = { sub: user.id, email: user.email };
    const accessToken = await this.jwt.signAsync(payload);

    return { accessToken };
  }

  async me(userId: string): Promise<SafeUser> {
    const u = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });
    if (!u) throw new UnauthorizedException('Invalid token');
    return u;
  }

  async logout() {
    return { ok: true };
  }
}
