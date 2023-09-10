import { Module } from "@nestjs/common";
import { MessagesResolver } from "./messages.resolver";
import { MessagesService } from "./messages.service";
import { PrismaService } from "src/prisma.service";
import { UsersService } from "src/users/users.service";
import { ChatsService } from "src/chats/chats.service";

@Module({
  providers: [
    MessagesResolver,
    MessagesService,
    PrismaService,
    UsersService,
    ChatsService,
  ],
})
export class MessagesModule {}
