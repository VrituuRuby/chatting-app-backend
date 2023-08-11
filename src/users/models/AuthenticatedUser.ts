import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AuthenticatedUser {
  @Field()
  id: string;
  @Field()
  username: string;
}
