import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class Chat {
  @Field({ nullable: true })
  name?: string;

  @Field()
  id: string;

  @Field()
  created_at: Date;
}
