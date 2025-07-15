import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PostgresConfig } from '../../config/postgres.config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useClass: PostgresConfig,
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
