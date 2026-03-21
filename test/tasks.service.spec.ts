import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InternalServerErrorException } from '@nestjs/common';
import { TasksService } from '../src/tasks/tasks.service';
import { TaskEntity } from '../src/tasks/task.entity';
import { TaskStatus } from '../src/tasks/interfaces/task.interface';

const mockTask: TaskEntity = {
  id: 'uuid-1',
  title: 'Test task',
  description: 'A description',
  status: TaskStatus.OPEN,
  createdAt: new Date(),
};

const mockRepository = {
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

describe('TasksService', () => {
  let service: TasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: getRepositoryToken(TaskEntity), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    jest.clearAllMocks();
  });

  describe('getAllTasks', () => {
    it('returns tasks from the repository with pagination', async () => {
      mockRepository.find.mockResolvedValue([mockTask]);
      const result = await service.getAllTasks({ limit: 20, offset: 0 });
      expect(result).toEqual([mockTask]);
      expect(mockRepository.find).toHaveBeenCalledWith({ take: 20, skip: 0, order: { createdAt: 'DESC' } });
    });

    it('passes limit and offset to the repository', async () => {
      mockRepository.find.mockResolvedValue([]);
      await service.getAllTasks({ limit: 5, offset: 10 });
      expect(mockRepository.find).toHaveBeenCalledWith({ take: 5, skip: 10, order: { createdAt: 'DESC' } });
    });

    it('returns an empty array when no tasks exist', async () => {
      mockRepository.find.mockResolvedValue([]);
      const result = await service.getAllTasks({ limit: 20, offset: 0 });
      expect(result).toEqual([]);
    });
  });

  describe('createTask', () => {
    it('creates and saves a task', async () => {
      mockRepository.create.mockReturnValue(mockTask);
      mockRepository.save.mockResolvedValue(mockTask);
      const result = await service.createTask({ title: 'Test task', description: 'A description' });
      expect(result).toEqual(mockTask);
      expect(mockRepository.create).toHaveBeenCalledWith({ title: 'Test task', description: 'A description' });
      expect(mockRepository.save).toHaveBeenCalledWith(mockTask);
    });

    it('works without a description', async () => {
      const taskNoDesc = { ...mockTask, description: undefined };
      mockRepository.create.mockReturnValue(taskNoDesc);
      mockRepository.save.mockResolvedValue(taskNoDesc);
      const result = await service.createTask({ title: 'Test task' });
      expect(result.description).toBeUndefined();
    });

    it('throws InternalServerErrorException when repository save fails', async () => {
      mockRepository.create.mockReturnValue(mockTask);
      mockRepository.save.mockRejectedValue(new Error('DB write error'));
      await expect(service.createTask({ title: 'Test task' })).rejects.toThrow(InternalServerErrorException);
    });

    it('throws InternalServerErrorException when repository save rejects with a non-Error value', async () => {
      mockRepository.create.mockReturnValue(mockTask);
      mockRepository.save.mockRejectedValue('string error');
      await expect(service.createTask({ title: 'Test task' })).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getAllTasks error handling', () => {
    it('throws InternalServerErrorException when repository find fails', async () => {
      mockRepository.find.mockRejectedValue(new Error('DB read error'));
      await expect(service.getAllTasks({ limit: 20, offset: 0 })).rejects.toThrow(InternalServerErrorException);
    });

    it('throws InternalServerErrorException when repository find rejects with a non-Error value', async () => {
      mockRepository.find.mockRejectedValue('string error');
      await expect(service.getAllTasks({ limit: 20, offset: 0 })).rejects.toThrow(InternalServerErrorException);
    });
  });
});
