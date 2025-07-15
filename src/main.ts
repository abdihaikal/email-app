import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { createSwaggerDocument } from './swagger';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Main Bootstrap');

  const configService = app.get<ConfigService>(ConfigService);

  const nodeEnv = configService.get<string>('NODE_ENV', 'production');
  const port = configService.get<number>('PORT', 3000);

  app.enableShutdownHooks();

  app.setGlobalPrefix(configService.get<string>('API_PREFIX', 'api/v1'));

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.enableCors({
    // origin: nodeEnv === 'production' ? [] : false,
    origin: '*',
    methods: ['POST', 'PUT', 'GET', 'DELETE'],
  });

  SwaggerModule.setup('api-docs', app, createSwaggerDocument(app));

  await app.listen(port);

  logger.log(`API Server listening on port ${port}`);
  logger.log(`Swagger UI available at http://localhost:${port}/api-docs`);
}

void bootstrap();
