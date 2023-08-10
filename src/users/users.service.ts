import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from './models/user.model';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';
import { hash } from 'bcrypt';

interface UpdateUserDTO {
  id: string;
  data: {
    username: string;
    password: string;
  };
}
@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) {}
  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    const userExists = await this.prismaService.user.findFirst({
      where: { username: data.username },
    });

    if (userExists) throw new BadRequestException('Username alredy in use');

    return await this.prismaService.user.create({
      data: { ...data, password: await hash(data.password, 8) },
    });
  }

  async updateUser({ id, data }: UpdateUserDTO): Promise<User> {
    const userExists = await this.prismaService.user.findFirst({
      where: { id },
    });

    if (!userExists) throw new NotFoundException("User doesn't exists");

    return await this.prismaService.user.update({ where: { id }, data });
  }

  async getAllUsers(): Promise<User[]> {
    return await this.prismaService.user.findMany();
  }

  async getUser(id: string): Promise<User> {
    const userExists = this.prismaService.user.findFirst({ where: { id } });
    if (!userExists) throw new NotFoundException("User does't exists");
    return userExists;
  }

  async deleteUser(id: string) {
    const userExists = this.prismaService.user.findFirst({ where: { id } });
    if (!userExists) throw new NotFoundException("User does't exists");
    await this.prismaService.user.delete({ where: { id } });
  }
}
