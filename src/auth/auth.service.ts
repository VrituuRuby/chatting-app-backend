import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

interface SignInDTO {
  username: string;
  password: string;
}

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}
  async signIn({ username, password }: SignInDTO) {
    const existingUser = await this.prismaService.user.findFirst({
      where: { username },
    });
    if (!existingUser) throw new UnauthorizedException('Wrong credentials');

    const confirmPassword = await compare(password, existingUser.password);
    if (!confirmPassword) throw new UnauthorizedException('Wrong credentials');

    const payload = { sub: existingUser.id, username: existingUser.username };

    const access_token = await this.jwtService.signAsync(payload);

    return {
      access_token,
    };
  }
}
