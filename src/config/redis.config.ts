import {
  BullRootModuleOptions,
  SharedBullConfigurationFactory,
} from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisConfig implements SharedBullConfigurationFactory {
  private readonly logger = new Logger(RedisConfig.name);

  constructor(private readonly configService: ConfigService) {}

  createSharedConfiguration(): BullRootModuleOptions {
    const attempts = this.configService.get<number>(
      'BULLMQ_ATTEMPTS_DEFAULT',
      3,
    );
    const delay = this.configService.get<number>(
      'BULLMQ_BACKOFF_DELAY_MS',
      1000,
    );

    const options: BullRootModuleOptions = {
      connection: {
        host: this.configService.get<string>('REDIS_HOST'),
        port: this.configService.get<number>('REDIS_PORT'),
        password: this.configService.get<string>('REDIS_PASSWORD'),
      },
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: true,
        attempts,
        backoff: {
          type: 'exponential',
          delay,
          jitter: 0.5,
        },
      },
    };

    this.logger.log(options);

    return options;
  }
}
