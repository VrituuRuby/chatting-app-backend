import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma.service';
import { v4 as uuid } from 'uuid';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, PrismaService],
    }).compile();
    prisma = module.get<PrismaService>(PrismaService);
    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should be able to create a new user', async () => {
    const newUser = {
      username: 'TestUser',
      password: 'Password',
    };

    const result = {
      id: uuid(),
      username: newUser.username,
      created_at: new Date(),
    };

    prisma.user.create = jest.fn().mockReturnValueOnce(result);

    expect(await service.createUser(newUser)).toBe(result);
  });

  it('should be able to update users info', async () => {
    const userId = uuid();

    const updatedUser = {
      username: 'updatedUser',
      password: 'newPassword',
    };

    const result = {
      id: userId,
      username: updatedUser.username,
      created_at: new Date(),
    };

    prisma.user.findFirst = jest.fn().mockReturnValueOnce({
      id: userId,
      username: 'OldUser',
      created_at: new Date(),
    });

    prisma.user.update = jest.fn().mockReturnValueOnce(result);

    expect(
      await service.updateUser({
        id: userId,
        data: updatedUser,
      }),
    ).toBe(result);
  });

  it('should be able to list all existing users', async () => {
    const users = [
      {
        id: uuid(),
        username: 'TestUser',
        created_at: new Date(),
      },
      {
        id: uuid(),
        username: 'SecondTestUser',
        created_at: new Date(),
      },
      {
        id: uuid(),
        username: 'ThirdTestUser',
        created_at: new Date(),
      },
    ];

    prisma.user.findMany = jest.fn().mockReturnValueOnce(users);

    expect(await service.getAllUsers()).toBe(users);
  });

  it('should be able to delete an existing user', async () => {
    const userId = uuid();

    prisma.user.delete = jest.fn();

    expect(await service.deleteUser(userId)).toBeCalled;
  });

  it('should NOT be able to create an user with an existing username', async () => {
    const existingUser = {
      id: uuid(),
      username: 'ExistingUser',
      createdAt: new Date(),
    };

    const newUser = {
      username: 'ExistingUser',
      password: 'password',
    };

    prisma.user.findFirst = jest.fn().mockReturnValueOnce(existingUser);

    expect(async () => await service.createUser(newUser)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should NOT be able to update a non existing user', async () => {
    const userId = uuid();

    const updatedUser = {
      username: 'updatedUser',
      password: 'newPassword',
    };

    prisma.user.findFirst = jest.fn().mockReturnValueOnce(null);

    expect(
      async () => await service.updateUser({ id: userId, data: updatedUser }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should NOT be able to list a non existing user', async () => {
    const userId = uuid();

    prisma.user.findFirst = jest.fn().mockReturnValueOnce(null);

    expect(async () => await service.getUser(userId)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should NOT be able to delete a non existing user', async () => {
    const userId = uuid();

    prisma.user.findFirst = jest.fn().mockReturnValueOnce(null);

    expect(async () => await service.deleteUser(userId)).rejects.toThrow(
      NotFoundException,
    );
  });

  it.todo('should NOT be able to update user without user authentication');
  it.todo('should NOT be able to delete user without user authentication');
});
