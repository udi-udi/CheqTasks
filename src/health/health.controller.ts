import {Controller, Get, Header, ServiceUnavailableException} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiProperty } from '@nestjs/swagger';
import { HealthService } from './health.service';

class HealthResponseDto {
  @ApiProperty({ example: 'ok', enum: ['ok', 'error'], description: 'Overall service status' })
  status!: string;

  @ApiProperty({ example: 42.3, description: 'Process uptime in seconds' })
  uptime!: number;

  @ApiProperty({ example: 'ok', enum: ['ok', 'unreachable'], description: 'Database connectivity status' })
  db!: string;
}

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Check service health', description: 'Returns process uptime and database connectivity. Used by load balancers and uptime monitors.' })
  @ApiResponse({ status: 200, description: 'Service is healthy', type: HealthResponseDto })
  @ApiResponse({ status: 503, description: 'Service unavailable — DB unreachable', type: HealthResponseDto })
  async check(): Promise<{ status: string; uptime: number; db: string }> {
    const dbOk = await this.healthService.checkDb();
    if (!dbOk) {
      throw new ServiceUnavailableException({ status: 'error', uptime: process.uptime(), db: 'unreachable' });
    }
    return { status: 'ok', uptime: process.uptime(), db: 'ok' };
  }

  @Get('status')
  @Header('Cache-Control', 'public, max-age=10')
  getStatus() {
    return { message: 'alive', time: Date.now() };
  }
}
