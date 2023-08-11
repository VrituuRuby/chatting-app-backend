import { Test, TestingModule } from '@nestjs/testing';
import { ChatsService } from './chats.service';
import { PrismaService } from '../prisma.service';

describe('ChatsService', () => {
  let service: ChatsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatsService, PrismaService],
    }).compile();

    service = module.get<ChatsService>(ChatsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should be able to create a new chat', async () => {
    const newChat = {
      is_private: true,
    };

    const result = {
      created_at: new Date(),
      id: 'chat_random_uuid',
      is_private: true,
    };

    prisma.chat.create = jest.fn().mockReturnValueOnce(result);

    expect(
      await service.createChat({ userId: 'random-uuid', data: newChat }),
    ).toHaveProperty('id');
  });
  it('should be able to add users to a chat', async () => {
    const usersIds = ['first_user_uuid', 'second_user_uuid'];

    prisma.chat.update = jest.fn().mockReturnValueOnce({
      is_private: false,
      id: 'chat_uuid',
      users: [
        { id: 'first_user_uuid', username: 'FirstUser' },
        { id: 'second_user_uuid', username: 'SecondUser' },
      ],
    });

    expect(await service.addUser({ usersIds, chatId: 'chat_uuid' }));
  });

  it.todo('should be able to create a new chat with users');
  it.todo(
    'should be able to send push notification when user is added to a new chat',
  );
  it.todo(
    'should be able to send push notification when a user is removed from a chat',
  );
  it.todo('should NOT be able to add users without being member of the chat');
  it.todo('should NOT be able to add non-existing users');
  it.todo('should not be able to create a new chat with non-existing users');
});
