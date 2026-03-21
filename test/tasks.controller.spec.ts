import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from '../src/tasks/tasks.controller';
import { TasksService } from '../src/tasks/tasks.service';
import { TaskEntity } from '../src/tasks/task.entity';
import { TaskStatus } from '../src/tasks/interfaces/task.interface';
import { PaginationQueryDto } from '../src/tasks/dto/pagination-query.dto';

const defaultPagination: PaginationQueryDto = { limit: 20, offset: 0 };

const mockTask: TaskEntity = {
  id: 'uuid-1',
  title: 'Test task',
  description: 'A description',
  status: TaskStatus.OPEN,
  createdAt: new Date(),
};

const mockTasksService = {
  getAllTasks: jest.fn(),
  createTask: jest.fn(),
};

describe('TasksController', () => {
  let controller: TasksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [{ provide: TasksService, useValue: mockTasksService }],
    }).compile();

    controller = module.get<TasksController>(TasksController);
    jest.clearAllMocks();
  });

  describe('getAllTasks', () => {
    it('returns the list from the service', async () => {
      mockTasksService.getAllTasks.mockResolvedValue([mockTask]);
      const result = await controller.getAllTasks(defaultPagination);
      expect(result).toEqual([mockTask]);
      expect(mockTasksService.getAllTasks).toHaveBeenCalledWith(defaultPagination);
    });

    it('forwards pagination params to the service', async () => {
      mockTasksService.getAllTasks.mockResolvedValue([]);
      const pagination: PaginationQueryDto = { limit: 5, offset: 10 };
      await controller.getAllTasks(pagination);
      expect(mockTasksService.getAllTasks).toHaveBeenCalledWith(pagination);
    });

    it('returns an empty array when no tasks exist', async () => {
      mockTasksService.getAllTasks.mockResolvedValue([]);
      const result = await controller.getAllTasks(defaultPagination);
      expect(result).toEqual([]);
    });
  });

  describe('createTask', () => {
    it('delegates to the service and returns the new task', async () => {
      mockTasksService.createTask.mockResolvedValue(mockTask);
      const dto = { title: 'Test task', description: 'A description' };
      const result = await controller.createTask(dto);
      expect(result).toEqual(mockTask);
      expect(mockTasksService.createTask).toHaveBeenCalledWith(dto);
    });

    it('works without a description', async () => {
      const taskNoDesc = { ...mockTask, description: undefined };
      mockTasksService.createTask.mockResolvedValue(taskNoDesc);
      const result = await controller.createTask({ title: 'Test task' });
      expect(result.description).toBeUndefined();
    });

    it('propagates error when service throws', async () => {
      mockTasksService.createTask.mockRejectedValue(new Error('Service error'));
      await expect(controller.createTask({ title: 'Test task' })).rejects.toThrow('Service error');
    });
  });

  describe('getAllTasks error handling', () => {
    it('propagates error when service throws', async () => {
      mockTasksService.getAllTasks.mockRejectedValue(new Error('Service error'));
      await expect(controller.getAllTasks(defaultPagination)).rejects.toThrow('Service error');
    });
  });
});
