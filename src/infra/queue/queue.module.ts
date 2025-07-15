import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

import { RedisConfig } from '../../config/redis.config';
import { ExternalModule } from '../external/external.module';
import { MessageConsumer } from './message.consumer';
import { MessageProducer } from './message.producer';
import { MESSAGE_QUEUE_ID } from './queue.constant';

@Module({
  imports: [
    BullModule.forRootAsync({
      useClass: RedisConfig,
    }),
    BullModule.registerQueueAsync({
      name: MESSAGE_QUEUE_ID,
    }),
    ExternalModule,
  ],
  providers: [MessageProducer, MessageConsumer],
  exports: [BullModule, MessageProducer, MessageConsumer],
})
export class QueueModule {}
