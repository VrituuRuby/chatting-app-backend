import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const reqCtx = ctx.getContext();
    const req = reqCtx.req;

    const token = this.extractTokenFromHeaders(req);

    if (!token) {
      throw new UnauthorizedException("Missing token");
    }
    try {
      const payload = await this.jwtService.verifyAsync(token);
      req["user"] = {
        username: payload.username,
        id: payload.sub,
      };
    } catch {
      throw new UnauthorizedException("Invalid token");
    }
    return true;
  }
  private extractTokenFromHeaders(req: any): string | undefined {
    if (req.extra) {
      const [type, token] = req.extra.access_token.split(" ");
      return type === "Bearer" ? token : undefined;
    } else {
      const [type, token] = req.headers.authorization?.split(" ") ?? [];
      return type === "Bearer" ? token : undefined;
    }
  }
}
