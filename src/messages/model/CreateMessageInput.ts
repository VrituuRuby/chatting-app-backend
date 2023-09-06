import { InputType } from "@nestjs/graphql";

@InputType()
export class CreateMessageInput {
  user_id: string;
  chat_id: string;
  content: string;
}
