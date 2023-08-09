import { Injectable } from '@nestjs/common';
import { User } from './models/user.model';
import { PrismaService } from 'src/prisma.service';
import { Prisma } from '@prisma/client';
import { hash } from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) {}
  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return await this.prismaService.user.create({
      data: { ...data, password: await hash(data.password, 8) },
    });
  }

  async getUsers(): Promise<User[]> {
    return await this.prismaService.user.findMany();
  }
}
