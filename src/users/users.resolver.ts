import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User } from './models/user.model';
import { UsersService } from './users.service';
import { CreateUserInput } from './models/CreateUserInput';

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
}
