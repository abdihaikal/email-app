import { ArgumentMetadata, ParseUUIDPipe } from '@nestjs/common';

export class CustomParseUUIDPipe extends ParseUUIDPipe {
  async transform(value: string, metadata: ArgumentMetadata): Promise<string> {
    try {
      return await super.transform(value, metadata);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw this.exceptionFactory('Invalid ID format');
    }
  }
}
