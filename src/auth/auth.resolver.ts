import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { SignInInput } from './models/SignInInput';
import { AuthService } from './auth.service';
import { AuthDTO } from './models/AuthDTO';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation((returns) => AuthDTO)
  async signIn(@Args('signInInput') { password, username }: SignInInput) {
    return await this.authService.signIn({ username, password });
  }
}
