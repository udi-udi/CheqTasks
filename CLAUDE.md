# CLAUDE.md

## Project Overview
A robust RESTful backend service built with NestJS for managing tasks. This system serves as a foundational API emphasizing asynchronous architecture, input validation, and high test coverage.

## Core Features
* Task Management: Full CRUD capabilities for task resources.
* Input Validation: Strict schema validation for all incoming data.
* Health Monitoring: Dedicated endpoint for load balancers and uptime checks.
* Asynchronous Architecture: Non-blocking I/O operations using NestJS best practices.
* Security & Logging: Integrated middleware for request processing.

## Technology Stack

### Backend
* Framework: NestJS (Node.js)
* Language: TypeScript
* Database: In-memory store (Development/Testing) or PostgreSQL (Production)
* Validation: class-validator + class-transformer
* Testing: Jest (Target: 80%+ Coverage)
* Documentation: Swagger/OpenAPI (@nestjs/swagger)

## Project Structure

/
├── src/
│   ├── tasks/                  # Tasks Module
│   │   ├── dto/                # Data Transfer Objects
│   │   │   └── create-task.dto.ts
│   │   ├── interfaces/         # Task types & interfaces
│   │   ├── tasks.controller.ts # Route handlers
│   │   ├── tasks.service.ts    # Business logic
│   │   └── tasks.module.ts
│   ├── common/                 # Global shared resources
│   │   ├── middleware/         # Logging / Auth middleware
│   │   │   └── logger.middleware.ts
│   │   └── guards/             # Authentication guards
│   ├── health/                 # Health check module
│   │   └── health.controller.ts
│   ├── app.module.ts           # Root module
│   └── main.ts                 # Entry point
├── test/                       # Integration & Unit tests
│   ├── tasks.service.spec.ts
│   └── tasks.controller.spec.ts
├── package.json
├── tsconfig.json
└── CLAUDE.md                   # This file

## API Endpoints

### Tasks
* GET /tasks - Retrieve a list of all tasks.
* POST /tasks - Create a new task.
    * Body: { title: string, description?: string }
    * Validation: Title is required, max length 100 chars.

### System
* GET /health - Returns 200 OK with system uptime and status.

## Key Requirements & Logic

### Asynchronous Operations
All service methods must return Promise<T> to respect the asynchronous nature of Node.js.

### Middleware Implementation
A global or route-specific Logger middleware is required to log the Method, Path, and Timestamp for every incoming request.

### Testing Strategy
* Unit Testing: Focus on TasksService logic.
* Mocking: Use Jest to mock database/repository calls to ensure isolated tests.
* Coverage: Maintain a minimum of 80% line coverage.

## Validation Rules
* POST /tasks:
    * title: Required, String, Min length 3.
    * description: Optional, String, Max length 500.
    * status: Defaults to OPEN.

## Development Guidelines

### Code Style
* Follow NestJS dependency injection patterns.
* Use PascalCase for classes, camelCase for variables/methods.
* Always define return types for functions.

### Running the Project
1. Install Dependencies: npm install
2. Start Development: npm run start:dev
3. Run Tests: npm run test
4. Check Coverage: npm run test:cov

---
*Note: when a task is completed, mark as done the corresponding task in the tasks list above.*