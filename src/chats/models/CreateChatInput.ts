import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class CreateChatInput {
  @Field({ nullable: true })
  name?: string;

  @Field((type) => [String], { nullable: true })
  usersIds?: string[];
}
