import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { Message, User } from "@prisma/client";

interface CreateMessageDTO {
  user_id: string;
  chat_id: string;
  content: string;
}

interface EditMessageDTO {
  user_id: string;
  message_id: string;
  content: string;
}

interface IFindUserInChat {
  user_id: string;
  chat_id: string;
}

interface IDeleteMessage {
  user_id: string;
  message_id: string;
}

@Injectable()
export class MessagesService {
  constructor(private prismaService: PrismaService) {}

  async findMessageById(id: string): Promise<Message> {
    const message = await this.prismaService.message.findFirst({
      where: { id },
    });
    if (!message) throw new NotFoundException("Message not found.");
    return message;
  }

  private async findUserInChat({
    user_id,
    chat_id,
  }: IFindUserInChat): Promise<User> {
    const userInChat = await this.prismaService.user.findFirst({
      where: {
        id: user_id,
        chats: {
          some: {
            id: chat_id,
          },
        },
      },
    });

    if (!userInChat)
      throw new UnauthorizedException("User is not a member of this chat");

    return userInChat;
  }

  async createMessage({
    user_id,
    chat_id,
    content,
  }: CreateMessageDTO): Promise<Message> {
    await this.findUserInChat({ user_id, chat_id });
    return await this.prismaService.message.create({
      data: { content, chat_id, user_id },
    });
  }

  async editMessage({
    message_id,
    content,
    user_id,
  }: EditMessageDTO): Promise<Message> {
    const message = await this.findMessageById(message_id);

    await this.findUserInChat({
      chat_id: message.chat_id,
      user_id,
    });

    return await this.prismaService.message.update({
      where: { id: message_id },
      data: { content, edited_at: new Date() },
    });
  }

  async listAllByChat({
    chat_id,
    user_id,
  }: IFindUserInChat): Promise<Message[]> {
    await this.findUserInChat({ chat_id, user_id });
    return await this.prismaService.message.findMany({ where: { chat_id } });
  }

  async deleteMessage({ message_id, user_id }: IDeleteMessage) {
    const message = await this.findMessageById(message_id);
    await this.findUserInChat({ chat_id: message.chat_id, user_id });
    await this.prismaService.message.delete({ where: { id: message_id } });
    return {
      status: "ok",
      message: "Message deleted successfully",
    };
  }

  async getMessagesByChatId(chat_id: string): Promise<Message[]> {
    const existingChat = await this.prismaService.chat.findUnique({
      where: { id: chat_id },
    });
    if (!existingChat) throw new NotFoundException("Chat doesn't existis");

    return await this.prismaService.message.findMany({ where: { chat_id } });
  }
}
