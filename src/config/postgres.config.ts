import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

@Injectable()
export class PostgresConfig implements TypeOrmOptionsFactory {
  private readonly logger = new Logger(PostgresConfig.name);

  constructor(private readonly configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'production');

    const options: TypeOrmModuleOptions = {
      type: 'postgres',
      host: this.configService.get<string>('POSTGRES_HOST', 'localhost'),
      port: this.configService.get<number>('POSTGRES_PORT', 5432),
      username: this.configService.get<string>('POSTGRES_USER', 'postgres'),
      password: this.configService.get<string>('POSTGRES_PASSWORD', 'postgres'),
      database: this.configService.get<string>('POSTGRES_DB', 'postgres'),
      autoLoadEntities: true,
      synchronize: nodeEnv !== 'production',
      logging: nodeEnv !== 'production',
      // logging: true,
      migrationsRun: true,
      migrations: [__dirname + '../../infra/database/migrations/**/*{.ts,.js}'],
    };

    this.logger.log(JSON.stringify(options, null, 2));

    return options;
  }
}
