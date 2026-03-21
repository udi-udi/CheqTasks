import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskEntity } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    @InjectRepository(TaskEntity)
    private readonly tasksRepository: Repository<TaskEntity>,
  ) {}

  async getAllTasks({ limit, offset }: PaginationQueryDto): Promise<TaskEntity[]> {
    try {
      return await this.tasksRepository.find({ take: limit, skip: offset, order: { createdAt: 'DESC' } });
    } catch (error) {
      this.logger.error('Failed to retrieve tasks', error instanceof Error ? error.stack : String(error));
      throw new InternalServerErrorException('Failed to retrieve tasks');
    }
  }

  async createTask(dto: CreateTaskDto): Promise<TaskEntity> {
    try {
      const task = this.tasksRepository.create(dto);
      return await this.tasksRepository.save(task);
    } catch (error) {
      this.logger.error('Failed to create task', error instanceof Error ? error.stack : String(error));
      throw new InternalServerErrorException('Failed to create task');
    }
  }
}
