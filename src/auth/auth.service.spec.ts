import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { PrismaService } from "../prisma.service";
import { v4 as uuid } from "uuid";
import { hash } from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { UnauthorizedException } from "@nestjs/common";

describe("AuthService", () => {
  let service: AuthService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, PrismaService, JwtService],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should be able to generate and return a JWT", async () => {
    prisma.user.findFirst = jest.fn().mockReturnValueOnce({
      id: uuid(),
      username: "ExistingUser",
      password: await hash("Password", 8),
    });

    expect(
      await service.signIn({ username: "ExistingUser", password: "Password" }),
    ).toHaveProperty("access_token");
  });
  it("should NOT be able to generate and return a JWT in case of wrong credential", async () => {
    prisma.user.findFirst = jest.fn().mockReturnValueOnce(null);

    expect(
      async () =>
        await service.signIn({
          username: "NonExistingUser",
          password: "CorrectPassword",
        }),
    ).rejects.toThrow(UnauthorizedException);

    prisma.user.findFirst = jest.fn().mockReturnValueOnce({
      id: uuid(),
      username: "ExistingUser",
      password: await hash("CorrectPassword", 8),
      created_at: new Date(),
    });

    expect(
      async () =>
        await service.signIn({
          username: "ExistingUser",
          password: "IncorrectPassword",
        }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
