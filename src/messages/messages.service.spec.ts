import { Test, TestingModule } from "@nestjs/testing";
import { MessagesService } from "./messages.service";
import { PrismaService } from "../prisma.service";
import { UnauthorizedException } from "@nestjs/common";
import { Chat, Message, User } from "@prisma/client";

const chat: Chat[] = [
  {
    created_at: new Date(),
    id: "existing-chat",
    is_private: true,
  },
];

const user: User[] = [
  {
    created_at: new Date(),
    id: "existing-user",
    password: "HASH-PASSWORD",
    username: "TestUser",
  },
];

const messages: Message[] = [
  {
    chat_id: "existing-chat",
    content: "HelloWorld",
    created_at: new Date(),
    edited_at: null,
    id: "random-message-id",
    user_id: "existing-user",
  },
  {
    chat_id: "existing-chat",
    content: "Edit Me!",
    created_at: new Date(),
    edited_at: null,
    id: "message-update",
    user_id: "existing-user",
  },
  {
    chat_id: "existing-chat",
    content: "Delete Me!",
    created_at: new Date(),
    edited_at: null,
    id: "message-delete",
    user_id: "existing-user",
  },
  {
    chat_id: "existing-chat",
    content: "List Me!",
    created_at: new Date(),
    edited_at: null,
    id: "message-list",
    user_id: "existing-user",
  },
];

describe("MessagesService", () => {
  let service: MessagesService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MessagesService, PrismaService],
    }).compile();

    service = module.get<MessagesService>(MessagesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should be able to create a new message", async () => {
    prisma.user.findFirst = jest.fn().mockResolvedValueOnce({
      id: "existing-user",
      name: "TestUser",
    });
    prisma.message.create = jest.fn().mockResolvedValueOnce({
      id: "random-message-id",
      user_id: "random-user-id",
      chat_id: "random-chat-id",
      created_at: new Date(),
      edited_at: null,
      content: "Hello World, Testing",
    });

    const result = await service.createMessage({
      user_id: "random-user-id",
      chat_id: "random-chat-id",
      content: "Hello World, Testing",
    });

    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("created_at");
  });

  it("should be able to edit an existing message", async () => {
    const user_id = "existing-user-id";
    const message_id = "existing-message-id";
    const content = "new edited message";

    prisma.message.findFirst = jest.fn().mockReturnValueOnce({
      id: "message-id",
      user_id: "some-user-id",
      chat_id: "some-chat-id",
      created_at: new Date(),
      edited_at: null,
      content: "Hello",
    });

    prisma.user.findFirst = jest.fn().mockResolvedValueOnce({
      id: "random-user-id",
      username: "test-user",
      password: "HASHED-PASSWORD",
      created_at: new Date(),
    });

    prisma.message.update = jest.fn().mockResolvedValueOnce({
      id: "existing-message-id",
      user_id: "random-user-id",
      chat_id: "random-chat-id",
      created_at: new Date(),
      edited_at: new Date(),
      content: "new edited message",
    });

    const result = await service.editMessage({ user_id, message_id, content });

    expect(result.edited_at).not.toEqual(null);
  });

  it("should be able to list all existing messages from a chat", async () => {
    prisma.user.findFirst = jest.fn().mockResolvedValueOnce({
      id: "user",
      username: "TestUser",
      password: "HASHED PASSWORD",
    });
    prisma.message.findMany = jest.fn().mockResolvedValueOnce([
      {
        id: "1",
        chat_id: "random-chat-id",
        user_id: "user-1",
        content: "Hello world!",
      },
      {
        id: "1",
        chat_id: "random-chat-id",
        user_id: "user-1",
        content: "Hello world!",
      },
      {
        id: "1",
        chat_id: "random-chat-id",
        user_id: "user-1",
        content: "Hello world!",
      },
    ]);

    const result = await service.listAllByChat({
      chat_id: "random-chat-id",
      user_id: "user",
    });

    expect(result.length).toBe(3);
  });

  it("should be able to delete an existing message", async () => {
    prisma.message.delete = jest.fn().mockResolvedValueOnce({
      status: "ok",
      message: "Message deleted successfully",
    });

    prisma.user.findFirst = jest.fn().mockResolvedValueOnce({
      id: "user",
      username: "TestUser",
      password: "HASHED PASSWORD",
      created_at: new Date(),
    });

    prisma.message.findFirst = jest.fn().mockResolvedValueOnce({
      id: "message-id",
      user_id: "user",
      chat_id: "chat",
      created_at: new Date(),
      editet_at: null,
      content: "message",
    });

    const result = await service.deleteMessage({
      message_id: "message-id",
      user_id: "user",
    });

    expect(result.status).toBe("ok");
  });

  it("should NOT be possible to create a new message in a chat where user is not a member", async () => {
    expect(async () => {
      await service.createMessage({
        chat_id: "existing-room",
        content: "Hello World",
        user_id: "not-member-user",
      });
    }).rejects.toThrow(UnauthorizedException);
  });

  it("should NOT be possible to edit an existing message in a chat where user is not a member", async () => {
    prisma.message.findFirst = jest.fn().mockReturnValueOnce({
      id: "message-id",
      user_id: "some-user-id",
      chat_id: "some-chat-id",
      created_at: new Date(),
      edited_at: null,
      content: "Hello",
    });

    prisma.user.findFirst = jest.fn().mockResolvedValueOnce(null);

    expect(
      async () =>
        await service.editMessage({
          user_id: "non-member-user",
          content: "New text",
          message_id: "existing-message-id",
        }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it("should NOT be possible to delete an existing message in a chat where user is not a member", async () => {
    prisma.message.findFirst = jest.fn().mockReturnValueOnce({
      id: "message-id",
      user_id: "some-user-id",
      chat_id: "some-chat-id",
      created_at: new Date(),
      edited_at: null,
      content: "Hello",
    });

    prisma.user.findFirst = jest.fn().mockResolvedValueOnce(null);

    expect(
      async () =>
        await service.deleteMessage({
          message_id: "message-id",
          user_id: "non",
        }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it("should NOT be possible to list all messages where a user isn't a member", async () => {
    prisma.user.findFirst = jest.fn().mockResolvedValueOnce(null);

    expect(async () => {
      await service.listAllByChat({
        chat_id: "existing-chat",
        user_id: "non-member",
      });
    }).rejects.toThrow(UnauthorizedException);
  });
});
