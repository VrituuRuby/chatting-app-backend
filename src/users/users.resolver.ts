import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User } from './models/user.model';
import { UsersService } from './users.service';
import { CreateUserInput } from './models/CreateUserInput';
import { DeleteUserResponse } from './models/DeleteUserResponse';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { useUser } from './users.decorator';
import { AuthenticatedUser } from './models/AuthenticatedUser';
import { UpdateUserInput } from './models/UpdateUserInput';

@Resolver((of) => User)
export class UsersResolver {
  constructor(private usersService: UsersService) {}
  @Mutation((returns) => User)
  async createUser(@Args('createUserInput') data: CreateUserInput) {
    return this.usersService.createUser(data);
  }

  @Query((returns) => [User])
  async getUsers() {
    return this.usersService.getAllUsers();
  }

  @UseGuards(AuthGuard)
  @Mutation((returns) => User)
  async updateUser(
    @useUser('id')
    userId: string,
    @Args('updateUserInput') data: UpdateUserInput,
  ) {
    return await this.usersService.updateUser({ id: userId, data });
  }

  @UseGuards(AuthGuard)
  @Mutation((returns) => DeleteUserResponse)
  async deleteUser(@useUser('id') userId: string) {
    return await this.usersService.deleteUser(userId);
  }
}
