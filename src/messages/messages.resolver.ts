import {
  Args,
  Mutation,
  Parent,
  ResolveField,
  Resolver,
  Subscription,
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
import { PubSub } from "graphql-subscriptions";

@Resolver((of) => Message)
export class MessagesResolver {
  constructor(
    private messagesService: MessagesService,
    private usersService: UsersService,
    private chatsService: ChatsService,
    private pubSub: PubSub,
  ) {}

  @UseGuards(AuthGuard)
  @Mutation((returns) => Message)
  async createMessage(
    @Args("data") data: CreateMessageInput,
    @useUser() user: User,
  ) {
    const messageSended = await this.messagesService.createMessage({
      ...data,
      user_id: user.id,
    });
    this.pubSub.publish(`sended_${data.chat_id}`, {
      messageSended,
    });
    return messageSended;
  }

  @UseGuards(AuthGuard)
  @Subscription(() => Message)
  async messageSended(@useUser("id") user_id: string) {
    const chatsIds = (await this.chatsService.getChatsByUserId(user_id)).map(
      (chat) => `sended_${chat.id}`,
    );

    return this.pubSub.asyncIterator(chatsIds);
  }

  @UseGuards(AuthGuard)
  @Mutation((returns) => Message)
  async editMessage(
    @Args("data") data: EditMessageInput,
    @useUser("id") user_id: string,
  ) {
    const editedMessage = await this.messagesService.editMessage({
      user_id,
      ...data,
    });
    this.pubSub.publish(`edited_${editedMessage.chat_id}`, { editedMessage });
    return editedMessage;
  }

  @UseGuards(AuthGuard)
  @Subscription(() => Message)
  async messageEdited(@useUser("id") user_id: string) {
    const chatsIds = (await this.chatsService.getChatsByUserId(user_id)).map(
      (chat) => `edited_${chat.id}`,
    );
    return this.pubSub.asyncIterator(chatsIds);
  }

  @UseGuards(AuthGuard)
  @Mutation((returns) => DeleteMessageDTO)
  async deleteMessage(
    @Args("message_id") message_id: string,
    @useUser("id") user_id: string,
  ) {
    const messageDeleted = await this.messagesService.deleteMessage({
      message_id,
      user_id,
    });
    this.pubSub.publish(`deleted_${messageDeleted.chat_id}`, {
      messageDeleted,
    });
    return messageDeleted;
  }

  @UseGuards(AuthGuard)
  @Subscription(() => DeleteMessageDTO)
  async messageDeleted(@useUser("id") user_id: string) {
    const chatsIds = (await this.chatsService.getChatsByUserId(user_id)).map(
      (chat) => `deleted_${chat.id}`,
    );
    return this.pubSub.asyncIterator(chatsIds);
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
