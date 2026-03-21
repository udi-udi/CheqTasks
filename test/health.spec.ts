import { Test, TestingModule } from '@nestjs/testing';
import { ServiceUnavailableException } from '@nestjs/common';
import { getDataSourceToken } from '@nestjs/typeorm';
import { HealthController } from '../src/health/health.controller';
import { HealthService } from '../src/health/health.service';

// ── HealthService ──────────────────────────────────────────────────────────────

const mockDataSource = { query: jest.fn() };

describe('HealthService', () => {
  let service: HealthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        { provide: getDataSourceToken(), useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);
    jest.clearAllMocks();
  });

  it('returns true when the DB query succeeds', async () => {
    mockDataSource.query.mockResolvedValue([]);
    expect(await service.checkDb()).toBe(true);
  });

  it('returns false when the DB query throws', async () => {
    mockDataSource.query.mockRejectedValue(new Error('connection refused'));
    expect(await service.checkDb()).toBe(false);
  });
});

// ── HealthController ───────────────────────────────────────────────────────────

const mockHealthService = { checkDb: jest.fn() };

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: HealthService, useValue: mockHealthService }],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    jest.clearAllMocks();
  });

  it('returns status ok and db ok when DB is reachable', async () => {
    mockHealthService.checkDb.mockResolvedValue(true);
    const result = await controller.check();
    expect(result.status).toBe('ok');
    expect(result.db).toBe('ok');
    expect(typeof result.uptime).toBe('number');
  });

  it('throws ServiceUnavailableException when DB is unreachable', async () => {
    mockHealthService.checkDb.mockResolvedValue(false);
    await expect(controller.check()).rejects.toThrow(ServiceUnavailableException);
  });
});
