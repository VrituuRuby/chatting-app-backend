import { Field, ObjectType } from '@nestjs/graphql';
import { type } from 'os';

@ObjectType()
export class User {
  @Field()
  id: string;

  @Field()
  username: string;

  @Field()
  created_at: Date;
}
