import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus } from './interfaces/task.interface';

@Entity('tasks')
export class TaskEntity {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', description: 'Unique task identifier (UUID v4)' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ example: 'Buy groceries', description: 'Short task title', maxLength: 100 })
  @Column({ length: 100 })
  title!: string;

  @ApiProperty({ example: 'Milk, eggs, bread', description: 'Optional details about the task', maxLength: 500, required: false })
  @Column({ length: 500, nullable: true })
  description?: string;

  @ApiProperty({ enum: TaskStatus, example: TaskStatus.OPEN, description: 'Current task status', default: TaskStatus.OPEN })
  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.OPEN })
  status!: TaskStatus;

  @ApiProperty({ example: '2026-03-20T10:00:00.000Z', description: 'Timestamp when the task was created' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
