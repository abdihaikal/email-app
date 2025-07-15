import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  EventEmitterModule,
  EventEmitterReadinessWatcher,
} from '@nestjs/event-emitter';

import { CoreModule } from './core/core.module';
import { InfraModule } from './infra/infra.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local', '.env.dev', '.env.prod'],
    }),
    EventEmitterModule.forRoot({ global: true }),
    CoreModule,
    InfraModule,
  ],
})
export class AppModule implements OnApplicationBootstrap {
  constructor(
    private readonly eventEmitterReadiness: EventEmitterReadinessWatcher,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.eventEmitterReadiness.waitUntilReady();
  }
}
