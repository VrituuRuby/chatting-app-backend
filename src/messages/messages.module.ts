import { Module } from "@nestjs/common";
import { MessagesResolver } from "./messages.resolver";
import { MessagesService } from "./messages.service";
import { PrismaService } from "src/prisma.service";

@Module({
  providers: [MessagesResolver, MessagesService, PrismaService],
})
export class MessagesModule {}
