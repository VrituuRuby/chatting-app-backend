import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { Chat, Prisma, User } from "@prisma/client";
import { withLatestFrom } from "rxjs";

interface CreateChatDTO {
  userId: string;
  data: {
    name?: string;
    usersIds?: string[];
  };
}

interface AddUserDTO {
  chat_id: string;
  users_id: string[];
}

interface IChangeName {
  chat_id: string;
  name: string;
}

interface IRemoveUsers {
  chat_id: string;
  users_id: string[];
}
@Injectable()
export class ChatsService {
  constructor(private prismaService: PrismaService) {}

  async findAll(): Promise<Chat[]> {
    return this.prismaService.chat.findMany();
  }

  async getChatByID(id: string) {
    const chat = await this.prismaService.chat.findUnique({ where: { id } });
    if (!chat) throw new NotFoundException("Chat not found");
    return chat;
  }

  async createChat({ userId, data }: CreateChatDTO): Promise<Chat> {
    const { usersIds } = data;
    if (usersIds) {
      const existingUsers = await this.sanitizeExistingUsers(usersIds);

      return await this.prismaService.chat.create({
        data: {
          name: data.name,
          users: {
            connect: [{ id: userId }, ...existingUsers.map((id) => ({ id }))],
          },
        },
      });
    }

    return await this.prismaService.chat.create({
      data: {
        name: data.name,
        users: {
          connect: { id: userId },
        },
      },
    });
  }

  async sanitizeExistingUsers(usersIds: string[]): Promise<string[]> {
    return usersIds.filter(async (userId) => {
      const userExists = await this.prismaService.user.findUnique({
        where: { id: userId },
      });
      if (!userExists) {
        return;
      }
      return userId;
    });
  }

  async addUsers({
    chat_id,
    users_id,
  }: AddUserDTO): Promise<Prisma.ChatGetPayload<{ include: { users: true } }>> {
    const sanitizedUsersIds = await this.sanitizeExistingUsers(users_id);

    return await this.prismaService.chat.update({
      where: { id: chat_id },
      data: {
        users: {
          connect: sanitizedUsersIds.map((userId) => ({
            id: userId,
          })),
        },
      },
      include: {
        users: true,
      },
    });
  }

  async removeUsers({ chat_id, users_id }: IRemoveUsers) {
    const sanitizedUsers = await this.sanitizeExistingUsers(users_id);
    return await this.prismaService.chat.update({
      where: { id: chat_id },
      data: {
        users: {
          disconnect: sanitizedUsers.map((id) => ({
            id,
          })),
        },
      },
    });
  }

  async changeName({ chat_id, name }: IChangeName) {
    const existingChat = await this.prismaService.chat.findUnique({
      where: { id: chat_id },
    });
    if (!existingChat) throw new NotFoundException("Chat doesn't exists");

    return await this.prismaService.chat.update({
      where: { id: chat_id },
      data: { name },
    });
  }

  async deleteChat(chat_id: string) {
    const existingChat = await this.prismaService.chat.findUnique({
      where: { id: chat_id },
    });
    if (!existingChat) throw new NotFoundException("Chat doesn't exists");
    await this.prismaService.chat.delete({ where: { id: chat_id } });
    return true;
  }

  async getChatsByUserId(user_id: string): Promise<Chat[]> {
    const existingUser = await this.prismaService.user.findUnique({
      where: { id: user_id },
    });
    if (!existingUser) throw new NotFoundException("User not found");

    return await this.prismaService.chat.findMany({
      where: { users: { some: { id: user_id } } },
    });
  }
}
