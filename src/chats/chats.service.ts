import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';

interface CreateChatDTO {
  userId: string;
  data: {
    is_private: boolean;
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

  async createChat({
    userId,
    data,
  }: CreateChatDTO): Promise<
    Prisma.ChatGetPayload<{ include: { users: true } }>
  > {
    const { is_private, usersIds } = data;
    if (usersIds) {
      const existingUsers = await this.sanitizeExistingUsers(usersIds);

      return await this.prismaService.chat.create({
        data: {
          is_private,
          users: {
            connect: [{ id: userId }, ...existingUsers.map((id) => ({ id }))],
          },
        },
        include: {
          users: true,
        },
      });
    }

    return await this.prismaService.chat.create({
      data: {
        is_private,
        users: {
          connect: { id: userId },
        },
      },
      include: {
        users: true,
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
}
