import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { TaskEntity } from './task.entity';

@ApiTags('tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve tasks', description: 'Returns a paginated list of tasks ordered by creation date (newest first). Defaults: limit=20, offset=0.' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20, description: 'Number of tasks to return (1–100)' })
  @ApiQuery({ name: 'offset', required: false, type: Number, example: 0, description: 'Number of tasks to skip' })
  @ApiResponse({ status: 200, description: 'Paginated list of tasks', type: [TaskEntity] })
  @ApiResponse({ status: 500, description: 'Database error' })
  getAllTasks(@Query() pagination: PaginationQueryDto): Promise<TaskEntity[]> {
    return this.tasksService.getAllTasks(pagination);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new task', description: 'Creates a task with status OPEN. Title is required (3–100 chars); description is optional (max 500 chars).' })
  @ApiBody({ type: CreateTaskDto })
  @ApiResponse({ status: 201, description: 'Task created successfully', type: TaskEntity })
  @ApiResponse({ status: 400, description: 'Validation failed — title missing or too short/long' })
  @ApiResponse({ status: 500, description: 'Database error' })
  createTask(@Body() dto: CreateTaskDto): Promise<TaskEntity> {
    return this.tasksService.createTask(dto);
  }
}
