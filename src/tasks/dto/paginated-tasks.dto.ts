import { ApiProperty } from '@nestjs/swagger';
import { TaskEntity } from '../task.entity';

export class PaginatedTasksDto {
  @ApiProperty({ type: [TaskEntity], description: 'List of tasks for the requested page' })
  data!: TaskEntity[];

  @ApiProperty({ example: 42, description: 'Total number of tasks across all pages' })
  total!: number;
}
