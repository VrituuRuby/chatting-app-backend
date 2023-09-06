import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { Chat, Prisma, User } from "@prisma/client";

interface CreateChatDTO {
  userId: string;
  data: {
    name?: string;
    usersIds?: string[];
  };
}

interface AddUserDTO {
  chatId: string;
  usersIds: string[];
}

@Injectable()
export class ChatsService {
  constructor(private prismaService: PrismaService) {}

  async findAll(): Promise<Chat[]> {
    return this.prismaService.chat.findMany();
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

  async addUser({
    chatId,
    usersIds,
  }: AddUserDTO): Promise<Prisma.ChatGetPayload<{ include: { users: true } }>> {
    const sanitizedUsersIds = await this.sanitizeExistingUsers(usersIds);

    return await this.prismaService.chat.update({
      where: { id: chatId },
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
