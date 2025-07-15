import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function createSwaggerDocument(app: INestApplication<any>) {
  return SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Email Message API by Abdi Haikal')
      .setDescription("API for managing user's email")
      .setContact('Abdi Haikal', '', '')
      .setVersion('1.0.0')
      .build(),
  );
}
