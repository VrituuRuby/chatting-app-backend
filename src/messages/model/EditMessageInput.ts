import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class EditMessageInput {
  @Field()
  message_id: string;
  @Field()
  content: string;
}
