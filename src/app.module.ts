import { Module } from "@nestjs/common";
import { GraphQLModule, OmitType } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { join } from "node:path";
import { UsersModule } from "./users/users.module";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import { PrismaService } from "./prisma.service";
import { AuthModule } from "./auth/auth.module";
import { ChatsModule } from "./chats/chats.module";
import { MessagesModule } from "./messages/messages.module";
import { PubSubModule } from "./pub-sub/pub-sub.module";
import { Context } from "graphql-ws";

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), "src/schema.gql"),
      installSubscriptionHandlers: true,
      subscriptions: {
        "graphql-ws": {
          onConnect: (context: Context<any, { access_token: string }>) => {
            const { connectionParams, extra } = context;
            extra.access_token = connectionParams.Authorization;
          },
        },
      },
      playground: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
    }),
    UsersModule,
    AuthModule,
    ChatsModule,
    MessagesModule,
    PubSubModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
