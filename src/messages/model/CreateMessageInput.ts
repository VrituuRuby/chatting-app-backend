import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class CreateMessageInput {
  @Field()
  chat_id: string;
  @Field()
  content: string;
}
