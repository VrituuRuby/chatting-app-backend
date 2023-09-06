import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class Message {
  @Field()
  id: string;
  @Field()
  user_id: string;
  @Field()
  chat_id: string;
  @Field()
  created_at: Date;
  @Field({ nullable: true })
  edited_at?: Date;
  @Field()
  content: string;
}
