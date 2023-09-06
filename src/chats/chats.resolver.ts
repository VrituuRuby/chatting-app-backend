import { useUser } from "src/users/users.decorator";
import { ChatsService } from "./chats.service";
import { CreateChatInput } from "./models/CreateChatInput";
import { Chat } from "./models/chat.model";
import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
} from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { AuthGuard } from "src/auth/auth.guard";
import { User } from "src/users/models/user.model";
import { UsersService } from "src/users/users.service";
import { MessagesService } from "src/messages/messages.service";
import { Message } from "src/messages/model/message.model";

@Resolver((of) => Chat)
export class ChatsResolver {
  constructor(
    private chatsService: ChatsService,
    private usersService: UsersService,
    private messagesService: MessagesService,
  ) {}

  @Query((returns) => [Chat])
  async listAllChats() {
    return this.chatsService.findAll();
  }

  @UseGuards(AuthGuard)
  @Mutation((returns) => Chat)
  async createChat(
    @Args("createChatInput") data: CreateChatInput,
    @useUser("id") userId: string,
  ) {
    return this.chatsService.createChat({ userId, data });
  }

  @Mutation(() => Boolean)
  async deleteChat(@Args("chat_id") chat_id: string) {
    return await this.chatsService.deleteChat(chat_id);
  }

  @ResolveField("users", (returns) => [User])
  async getUsers(@Parent() chat: Chat) {
    return this.usersService.getUsersByChatId(chat.id);
  }

  @ResolveField("message", (returns) => [Message])
  async getMessage(@Parent() chat: Chat) {
    return this.messagesService.getMessagesByChatId(chat.id);
  }
}
