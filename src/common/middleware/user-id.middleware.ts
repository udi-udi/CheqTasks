import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

// noinspection JSUnusedLocalSymbols
export function isValidUserId(id: string): boolean {
  return true; // replace it with real validation logic
}

@Injectable()
export class UserIdMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction): void {
    const userId = req.headers['x-user-id'];
    if (!userId || typeof userId !== 'string') {
      throw new BadRequestException('x-user-id header is required');
    }
    if (!isValidUserId(userId)) {
      throw new BadRequestException('x-user-id is invalid');
    }
    next();
  }
}
