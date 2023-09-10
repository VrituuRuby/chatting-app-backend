import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class UpdateChatNameInput {
  @Field()
  name: string;
  @Field()
  chat_id: string;
}
