import { Module } from "@nestjs/common";
import { MessagesResolver } from "./messages.resolver";
import { MessagesService } from "./messages.service";
import { PrismaService } from "src/prisma.service";
import { UsersService } from "src/users/users.service";
import { ChatsService } from "src/chats/chats.service";
import { PubSubModule } from "src/pub-sub/pub-sub.module";

@Module({
  imports: [PubSubModule],
  providers: [
    MessagesResolver,
    MessagesService,
    PrismaService,
    UsersService,
    ChatsService,
  ],
})
export class MessagesModule {}
