import { existsSync } from 'node:fs';
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

import { NestFactory } from '@nestjs/core';

import { AppModule } from '../src/app.module';
import { createSwaggerDocument } from '../src/swagger';

const outputFile = 'openapi-spec.json';
const outputDir = './openapi';
const outputPath = join(outputDir, outputFile);

async function generateOpenApiSpecFile(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const document = createSwaggerDocument(app);

  if (!existsSync(outputDir)) {
    await mkdir(outputDir, { recursive: true });
  }

  await writeFile(outputPath, JSON.stringify(document, null, 2));

  await app.close();
}

generateOpenApiSpecFile()
  .catch((error) => {
    console.log(error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
