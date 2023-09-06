import { Module } from "@nestjs/common";
import { ChatsService } from "./chats.service";
import { ChatsResolver } from "./chats.resolver";
import { PrismaService } from "src/prisma.service";
import { UsersService } from "src/users/users.service";
import { MessagesService } from "src/messages/messages.service";

@Module({
  providers: [
    ChatsService,
    ChatsResolver,
    PrismaService,
    UsersService,
    MessagesService,
  ],
})
export class ChatsModule {}
