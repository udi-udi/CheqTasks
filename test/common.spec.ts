import { ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '../src/common/guards/auth.guard';
import { LoggerMiddleware } from '../src/common/middleware/logger.middleware';
import { UserIdMiddleware, isValidUserId } from '../src/common/middleware/user-id.middleware';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';
import { AppLogger } from '../src/common/logger/app-logger';
import { plainToInstance } from 'class-transformer';
import { PaginationQueryDto } from '../src/tasks/dto/pagination-query.dto';

// ── AuthGuard ──────────────────────────────────────────────────────────────────

describe('AuthGuard', () => {
  it('always returns true', () => {
    const guard = new AuthGuard();
    expect(guard.canActivate({} as ExecutionContext)).toBe(true);
  });
});

// ── AllExceptionsFilter ────────────────────────────────────────────────────────

describe('AllExceptionsFilter', () => {
  const makeHost = (method = 'GET', url = '/tasks') => {
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const response = { status } as any;
    const request = { method, url } as any;
    const host = {
      switchToHttp: () => ({
        getResponse: () => response,
        getRequest: () => request,
      }),
    } as any;
    return { host, status, json };
  };

  it('returns the HttpException status and message', () => {
    const filter = new AllExceptionsFilter();
    const { host, status, json } = makeHost();
    filter.catch(new HttpException('Not found', HttpStatus.NOT_FOUND), host);
    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 404 }));
  });

  it('returns 500 for non-HTTP errors', () => {
    const filter = new AllExceptionsFilter();
    const { host, status, json } = makeHost();
    filter.catch(new Error('Unexpected failure'), host);
    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 500, path: '/tasks' }));
  });

  it('returns 500 when exception is a non-Error value', () => {
    const filter = new AllExceptionsFilter();
    const { host, status } = makeHost();
    filter.catch('plain string error', host);
    expect(status).toHaveBeenCalledWith(500);
  });
});

// ── PaginationQueryDto ─────────────────────────────────────────────────────────

describe('PaginationQueryDto', () => {
  it('defaults to limit=20 and offset=0', () => {
    const dto = new PaginationQueryDto();
    expect(dto.limit).toBe(20);
    expect(dto.offset).toBe(0);
  });

  it('transforms string query params to numbers', () => {
    const dto = plainToInstance(PaginationQueryDto, { limit: '5', offset: '10' });
    expect(dto.limit).toBe(5);
    expect(dto.offset).toBe(10);
  });
});

// ── UserIdMiddleware ───────────────────────────────────────────────────────────

describe('UserIdMiddleware', () => {
  const makeReq = (userId?: string) => ({
    headers: userId !== undefined ? { 'x-user-id': userId } : {},
  } as any);

  it('calls next() when x-user-id header is present', () => {
    const middleware = new UserIdMiddleware();
    const next = jest.fn();
    middleware.use(makeReq('user-123'), {} as any, next);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('throws BadRequestException when x-user-id header is missing', () => {
    const middleware = new UserIdMiddleware();
    expect(() => middleware.use(makeReq(), {} as any, jest.fn())).toThrow('x-user-id header is required');
  });

  it('throws BadRequestException when x-user-id is an empty string', () => {
    const middleware = new UserIdMiddleware();
    expect(() => middleware.use(makeReq(''), {} as any, jest.fn())).toThrow('x-user-id header is required');
  });
});

describe('isValidUserId', () => {
  it('returns true for any non-empty string (stub implementation)', () => {
    expect(isValidUserId('user-123')).toBe(true);
    expect(isValidUserId('anything')).toBe(true);
  });
});

// ── LoggerMiddleware ───────────────────────────────────────────────────────────

describe('LoggerMiddleware', () => {
  it('calls next() and logs the request', () => {
    const middleware = new LoggerMiddleware();
    const req = { method: 'GET', path: '/tasks' } as any;
    const res = {} as any;
    const next = jest.fn();
    const spy = jest.spyOn(AppLogger, 'log').mockImplementation(() => {});

    middleware.use(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('GET /tasks'), expect.any(String));
    spy.mockRestore();
  });
});
