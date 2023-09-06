import { Mutation, Resolver } from "@nestjs/graphql";
import { Message } from "./model/message.model";
import { MessagesService } from "./messages.service";

@Resolver((of) => Message)
export class MessagesResolver {
  constructor(private messagesService: MessagesService) {}

  @Mutation((returns) => Message)
  async createMessage() {
    return;
  }
}
