import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class UpdateUserInput {
  @Field({ nullable: true })
  username?: string;
  @Field({ nullable: true })
  password?: string;
}
