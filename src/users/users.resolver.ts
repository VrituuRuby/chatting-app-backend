import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from "@nestjs/graphql";
import { User } from "./models/user.model";
import { UsersService } from "./users.service";
import { CreateUserInput } from "./models/CreateUserInput";
import { DeleteUserResponse } from "./models/DeleteUserResponse";
import { UseGuards } from "@nestjs/common";
import { AuthGuard } from "src/auth/auth.guard";
import { useUser } from "./users.decorator";
import { UpdateUserInput } from "./models/UpdateUserInput";
import { ChatsService } from "src/chats/chats.service";
import { Chat } from "src/chats/models/chat.model";

@Resolver((of) => User)
export class UsersResolver {
  constructor(
    private usersService: UsersService,
    private chatService: ChatsService,
  ) {}

  @Mutation((returns) => User)
  async createUser(@Args("createUserInput") data: CreateUserInput) {
    return this.usersService.createUser(data);
  }

  @Query((returns) => [User])
  async getUsers() {
    return this.usersService.getAllUsers();
  }

  @UseGuards(AuthGuard)
  @Mutation((returns) => User)
  async updateUser(
    @useUser("id")
    userId: string,
    @Args("updateUserInput") data: UpdateUserInput,
  ) {
    return await this.usersService.updateUser({ id: userId, data });
  }

  @UseGuards(AuthGuard)
  @Mutation((returns) => DeleteUserResponse)
  async deleteUser(@useUser("id") userId: string) {
    return await this.usersService.deleteUser(userId);
  }

  @ResolveField("chats", (returns) => [Chat])
  async getChats(@Parent() user: User) {
    return await this.chatService.getChatsByUserId(user.id);
  }
}
