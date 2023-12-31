import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class EditMessageInput {
  @Field()
  message_id: string;
  @Field()
  content: string;
}
