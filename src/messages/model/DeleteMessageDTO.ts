import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export default class DeleteMessageDTO {
  @Field()
  status: string;
  @Field()
  message: string;
}
