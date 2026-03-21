import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AppLogger } from '../logger/app-logger';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction): void {
    // next() is called before logging so the handler starts processing immediately.
    // If logging were slow (e.g. remote log service), calling it first would delay every response.
    next();
    AppLogger.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`, LoggerMiddleware.name);
  }
}
