import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Chat, Prisma } from '@prisma/client';

interface CreateChatDTO {
  userId: string;
  data: Prisma.ChatCreateInput;
}

interface AddUserDTO {
  chatId: string;
  usersIds: string[];
}

@Injectable()
export class ChatsService {
  constructor(private prismaService: PrismaService) {}
  async createChat({ userId, data }: CreateChatDTO): Promise<Chat> {
    return await this.prismaService.chat.create({
      data: { ...data, users: { connect: [{ id: userId }] } },
    });
  }

  async addUser({ chatId, usersIds }: AddUserDTO) {
    return await this.prismaService.chat.update({
      where: { id: chatId },
      data: {
        users: {
          connect: usersIds.map((userId) => ({
            id: userId,
          })),
        },
      },
    });
  }
}
