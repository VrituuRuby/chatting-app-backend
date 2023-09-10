import {
  Args,
  Mutation,
  Parent,
  ResolveField,
  Resolver,
} from "@nestjs/graphql";
import { Message } from "./model/message.model";
import { MessagesService } from "./messages.service";
import { UseGuards } from "@nestjs/common";
import { AuthGuard } from "src/auth/auth.guard";
import { CreateMessageInput } from "./model/CreateMessageInput";
import { useUser } from "src/users/users.decorator";
import { User } from "src/users/models/user.model";
import { EditMessageInput } from "./model/EditMessageInput";
import DeleteMessageDTO from "./model/DeleteMessageDTO";
import { UsersService } from "src/users/users.service";
import { ChatsService } from "src/chats/chats.service";
import { Chat } from "src/chats/models/chat.model";

@Resolver((of) => Message)
export class MessagesResolver {
  constructor(
    private messagesService: MessagesService,
    private usersService: UsersService,
    private chatsService: ChatsService,
  ) {}

  @UseGuards(AuthGuard)
  @Mutation((returns) => Message)
  async createMessage(
    @Args("data") data: CreateMessageInput,
    @useUser() user: User,
  ) {
    return this.messagesService.createMessage({ ...data, user_id: user.id });
  }

  @UseGuards(AuthGuard)
  @Mutation((returns) => Message)
  async editMessage(
    @Args("data") data: EditMessageInput,
    @useUser("id") user_id: string,
  ) {
    return await this.messagesService.editMessage({ user_id, ...data });
  }

  @UseGuards(AuthGuard)
  @Mutation((returns) => DeleteMessageDTO)
  async deleteMessage(
    @Args("message_id") message_id: string,
    @useUser("id") user_id: string,
  ) {
    return await this.messagesService.deleteMessage({ message_id, user_id });
  }

  @ResolveField("user", (returns) => User)
  async getUser(@Parent() message: Message) {
    return await this.usersService.getUser(message.user_id);
  }

  @ResolveField("chat", (returns) => Chat)
  async getChat(@Parent() message: Message) {
    return await this.chatsService.getChatByID(message.chat_id);
  }
}
