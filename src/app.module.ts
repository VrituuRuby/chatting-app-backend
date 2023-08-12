import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'node:path';
import { UsersModule } from './users/users.module';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { PrismaService } from './prisma.service';
import { AuthResolver } from './auth/auth.resolver';
import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module';
import { ChatsModule } from './chats/chats.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      playground: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
    }),
    UsersModule,
    AuthModule,
    ChatsModule,
  ],
  providers: [PrismaService, AuthResolver, AuthService],
})
export class AppModule {}
