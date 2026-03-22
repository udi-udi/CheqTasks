import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskEntity } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { AppLogger } from '../common/logger/app-logger';

@Injectable()
export class TasksService {

  constructor(
    @InjectRepository(TaskEntity)
    private readonly tasksRepository: Repository<TaskEntity>,
  ) {}

  async getAllTasks({ limit, offset }: PaginationQueryDto, userId: string): Promise<{ data: TaskEntity[]; total: number }> {
    try {
      const [data, total] = await this.tasksRepository.findAndCount({ where: { userId }, take: limit, skip: offset, order: { createdAt: 'DESC' } });
      return { data, total };
    } catch (error) {
      AppLogger.error('Failed to retrieve tasks', error instanceof Error ? error.stack : String(error), TasksService.name);
      throw new InternalServerErrorException('Failed to retrieve tasks');
    }
  }

  async createTask(dto: CreateTaskDto, userId: string): Promise<TaskEntity> {
    try {
      const task = this.tasksRepository.create({ ...dto, userId });
      return await this.tasksRepository.save(task);
    } catch (error) {
      AppLogger.error('Failed to create task', error instanceof Error ? error.stack : String(error), TasksService.name);
      throw new InternalServerErrorException('Failed to create task');
    }
  }
}
