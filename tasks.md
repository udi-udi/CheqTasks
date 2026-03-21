# tasks.md

## Phase 1 — Project Setup

- [x] 1.1 Install dependencies (`npm install`)
- [x] 1.2 Install NestJS CLI and core packages (`@nestjs/core`, `@nestjs/common`, `@nestjs/platform-express`)
- [x] 1.3 Install validation packages (`class-validator`, `class-transformer`)
- [x] 1.4 Install Swagger packages (`@nestjs/swagger`, `swagger-ui-express`)
- [x] 1.5 Install testing packages (`jest`, `@nestjs/testing`, `supertest`)
- [x] 1.6 Configure `tsconfig.json` for NestJS (enable decorators, emit metadata)

## Phase 2 — Core Structure

- [x] 2.1 Create `src/main.ts` entry point (bootstrap app, enable validation pipe)
- [x] 2.2 Create `src/app.module.ts` root module
- [x] 2.3 Define `Task` interface in `src/tasks/interfaces/`
- [x] 2.4 Create `src/tasks/dto/create-task.dto.ts` with validation decorators
  - [x] `title`: required, string, min length 3
  - [x] `description`: optional, string, max length 500
  - [x] `status`: defaults to `OPEN`

## Phase 3 — Tasks Module

- [x] 3.1 Create `src/tasks/tasks.module.ts`
- [x] 3.2 Create `src/tasks/tasks.service.ts` with in-memory store
  - [x] `getAllTasks(): Promise<Task[]>`
  - [x] `createTask(dto): Promise<Task>`
- [x] 3.3 Create `src/tasks/tasks.controller.ts`
  - [x] `GET /tasks` — retrieve all tasks
  - [x] `POST /tasks` — create a new task

## Phase 4 — Common Infrastructure

- [x] 4.1 Create `src/common/middleware/logger.middleware.ts` (log method, path, timestamp)
- [x] 4.2 Register logger middleware globally in `app.module.ts`
- [x] 4.3 Create `src/common/guards/` (auth guard scaffold)

## Phase 5 — Health Module

- [x] 5.1 Create `src/health/health.controller.ts`
- [x] 5.2 Implement `GET /health` returning `200 OK` with uptime and status

## Phase 6 — Documentation

- [x] 6.1 Set up Swagger/OpenAPI in `main.ts`
- [x] 6.2 Annotate controller endpoints with `@ApiOperation`, `@ApiResponse`
- [x] 6.3 Annotate DTOs with `@ApiProperty`

## Phase 7 — Testing

- [x] 7.1 Write unit tests for `TasksService` in `test/tasks.service.spec.ts`
- [x] 7.2 Write unit tests for `TasksController` in `test/tasks.controller.spec.ts`
- [x] 7.3 Mock repository/in-memory store calls with Jest
- [x] 7.4 Achieve 80%+ line coverage (`npm run test:cov`)

## Phase 8 — Dockerization

- [x] 8.1 Write a multi-stage `Dockerfile` optimized for production
  - [x] Stage 1 (builder): install all dependencies and compile TypeScript
  - [x] Stage 2 (runner): copy only `dist/` and production `node_modules`, use a minimal Node image
- [x] 8.2 Add a `.dockerignore` to exclude `node_modules`, `dist`, `.env`, and test files

## Phase 9 — Infrastructure as Code (AWS CDK)

- [x] 9.1 Initialise a CDK app (`cdk init`) in an `infra/` subdirectory
- [x] 9.2 Define a VPC with public subnet for the EC2 instance
- [x] 9.3 Define an EC2 instance (t2.micro, Amazon Linux 2023)
  - [x] Attach an IAM role with least-privilege permissions
  - [x] Configure a security group (port 3000 inbound, port 22 for CI/CD SSH)
- [x] 9.4 Add user-data script to clone repo, build Docker image and run container on boot
- [x] 9.5 Export the instance public IP/DNS as a CDK output

## Phase 10 — CI/CD Pipeline (GitHub Actions)

- [x] 10.1 Create `.github/workflows/ci-cd.yml`
- [x] 10.2 On push: run unit tests (`npm test`)
- [x] 10.3 On push to `main`: build the Docker image on EC2
- [x] 10.4 On push to `main`: deploy to the EC2 instance via SSH
