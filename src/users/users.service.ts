import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { User } from "./models/user.model";
import { PrismaService } from "../prisma.service";
import { Prisma } from "@prisma/client";
import { hash } from "bcrypt";
import { DeleteUserResponse } from "./models/DeleteUserResponse";

interface UpdateUserDTO {
  id: string;
  data: {
    username?: string;
    password?: string;
  };
}
@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) {}
  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    const userExists = await this.prismaService.user.findFirst({
      where: { username: data.username },
    });

    if (userExists) throw new BadRequestException("Username alredy in use");

    return await this.prismaService.user.create({
      data: { ...data, password: await hash(data.password, 8) },
    });
  }

  async updateUser({ id, data }: UpdateUserDTO): Promise<User> {
    const { password, username } = data;
    const userToUpdate = await this.prismaService.user.findFirst({
      where: { id },
    });

    if (!userToUpdate) throw new NotFoundException("User doesn't exists");

    if (username) {
      const existingUser = await this.prismaService.user.findUnique({
        where: { username },
      });

      if (existingUser && existingUser.id !== id) {
        throw new BadRequestException("Username is alredy in use");
      }

      userToUpdate.username = username;
    }

    if (data.password) {
      const hashedPassword = await hash(data.password, 8);
      userToUpdate.password = hashedPassword;
    }

    return await this.prismaService.user.update({
      where: { id },
      data: userToUpdate,
    });
  }

  async getAllUsers(): Promise<User[]> {
    return await this.prismaService.user.findMany();
  }

  async getUser(id: string): Promise<User> {
    const userExists = this.prismaService.user.findFirst({ where: { id } });
    if (!userExists) throw new NotFoundException("User does't exists");
    return userExists;
  }

  async deleteUser(id: string): Promise<DeleteUserResponse> {
    try {
      const userExists = await this.prismaService.user.findFirst({
        where: { id },
      });
      if (!userExists) throw new NotFoundException("User doesn't exists");
      await this.prismaService.user.delete({ where: { id } });
      return {
        success: true,
        message: "User deleted sucessfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async getUsersByChatId(chat_id: string) {
    const existingChat = await this.prismaService.chat.findUnique({
      where: { id: chat_id },
    });
    if (!existingChat) throw new NotFoundException("Chat doesn't exisits");
    return await this.prismaService.user.findMany({
      where: { chats: { some: { id: chat_id } } },
    });
  }
}
