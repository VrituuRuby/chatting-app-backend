import { Module } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatsResolver } from './chats.resolver';
import { PrismaService } from 'src/prisma.service';

@Module({
  providers: [ChatsService, ChatsResolver, PrismaService],
})
export class ChatsModule {}
