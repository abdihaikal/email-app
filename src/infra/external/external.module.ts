import { Module } from '@nestjs/common';

import { EmailServiceClient } from './email-service.client';

@Module({
  providers: [EmailServiceClient],
  exports: [EmailServiceClient],
})
export class ExternalModule {}
