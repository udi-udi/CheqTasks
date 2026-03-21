import 'reflect-metadata';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { AppLogger } from './common/logger/app-logger';

if (!process.env.DATABASE_URL) {
  AppLogger.error(
    '[CheqTasks] Fatal: DATABASE_URL is not set.\n' +
    'Create a .env file (or set the environment variable) with:\n' +
    '  DATABASE_URL=postgresql://<user>:<password>@<host>/<db>',
  );
  process.exit(1);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalFilters(new AllExceptionsFilter());

  const config = new DocumentBuilder()
    .setTitle('CheqTasks API')
    .setDescription('RESTful API for managing tasks')
    .setVersion('1.0.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}

bootstrap();
