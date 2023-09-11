import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export default class DeleteMessageDTO {
  @Field()
  status: string;

  @Field()
  message: string;

  @Field()
  chat_id: string;

  @Field()
  message_id: string;
}
