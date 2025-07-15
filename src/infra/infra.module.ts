import { Module } from '@nestjs/common';

import { DatabaseModule } from './database/database.module';
import { ExternalModule } from './external/external.module';

@Module({
  imports: [DatabaseModule, ExternalModule],
  exports: [DatabaseModule, ExternalModule],
})
export class InfraModule {}
