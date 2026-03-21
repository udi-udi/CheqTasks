import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty({ example: 'Buy groceries', description: 'Task title — required, 3–100 characters', minLength: 3, maxLength: 100 })
  @IsString()
  @MinLength(3)
  title!: string;

  @ApiProperty({ example: 'Milk, eggs, bread', description: 'Optional elaboration on the task, up to 500 characters', maxLength: 500, required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
