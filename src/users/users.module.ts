import { Module } from "@nestjs/common";
import { UsersResolver } from "./users.resolver";
import { UsersService } from "./users.service";
import { PrismaService } from "src/prisma.service";
import { ChatsService } from "src/chats/chats.service";

@Module({
  providers: [UsersResolver, UsersService, PrismaService, ChatsService],
})
export class UsersModule {}
