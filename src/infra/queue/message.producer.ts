import { Job, Queue } from 'bullmq';
import { v4 as uuidv4 } from 'uuid';

import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { MESSAGE_QUEUE_ID } from './queue.constant';

export class MessageQueuePayload {
  // user
  user_id: string;
  user_email: string;
  user_location?: string;
  // message
  message_id: string;
  message_type: string;
  message_subject: string;
  message_content?: string;
  message_delay?: number;
}

export class MessageQueueData extends MessageQueuePayload {
  queue_id: string;
  queue_name: string;
}

type MessageJob = Job<MessageQueuePayload, MessageQueueData, string>;

@Injectable()
export class MessageProducer {
  private readonly logger = new Logger(MessageProducer.name);
  private readonly attempts: number;
  private readonly backoffDelayMs: number;

  constructor(
    @InjectQueue(MESSAGE_QUEUE_ID)
    private readonly queueService: Queue<MessageQueuePayload, MessageQueueData>,
    private readonly configService: ConfigService,
  ) {
    this.attempts = configService.get<number>('BULLMQ_ATTEMPTS_DEFAULT', 3);
    this.backoffDelayMs = configService.get<number>(
      'BULLMQ_BACKOFF_DELAY_MS',
      3000,
    );
  }

  async addJob(payload: MessageQueuePayload): Promise<MessageJob> {
    const id = uuidv4();
    const name = `sent-message-${payload.message_type}`.toLowerCase();

    const job = await this.queueService.add(
      name,
      Object.assign(payload, { queue_id: id, queue_name: name }),
      {
        jobId: id,
        delay: payload.message_delay || 0,
        removeOnComplete: true,
        removeOnFail: true,
        attempts: this.attempts,
        backoff: {
          type: 'exponential',
          delay: this.backoffDelayMs,
          jitter: 0.5,
        },
      },
    );
    return job;
  }

  async updateJobData(
    id: string,
    data: Partial<MessageQueueData>,
  ): Promise<void> {
    const job = await this.queueService.getJob(id);
    if (job) {
      const newData = Object.assign(new MessageQueueData(), job.data, data);
      await job.updateData(newData);
    }
  }

  async updateJobDelay(id: string, delay: number): Promise<void> {
    const job = await this.queueService.getJob(id);
    if (job) {
      await job.changeDelay(delay);
    }
  }

  async removeJobById(id: string): Promise<void> {
    const job = await this.queueService.getJob(id);
    if (job) {
      await job.remove();
    }
  }

  async removeJobByUserId(
    userId: string,
    messageId?: string,
    messageType?: string,
  ): Promise<void> {
    const jobs = await this.queueService.getJobs();
    if (!jobs.length) {
      return;
    }
    await Promise.all(
      jobs
        .filter((job) => {
          if (!(job && job.data)) {
            return false;
          }
          let isTrue = job.data.user_id === userId;
          if (messageId) {
            isTrue = isTrue && job.data.message_id === messageId;
          }
          if (messageType) {
            isTrue = isTrue && job.data.message_type === messageType;
          }
          return isTrue;
        })
        .map(async (job) => {
          const state = await job.getState();
          return state !== 'active' ? await job.remove() : null;
        }),
    );
  }

  async removeJobByMessageId(
    messageId: string,
    messageType?: string,
  ): Promise<void> {
    const jobs = await this.queueService.getJobs();
    if (!jobs.length) {
      return;
    }
    await Promise.all(
      jobs
        .filter((job) => {
          if (!(job && job.data)) {
            return false;
          }
          let isTrue = job.data.message_id === messageId;
          if (messageType) {
            isTrue = isTrue && job.data.message_type === messageType;
          }
          return isTrue;
        })
        .map(async (job) => {
          const state = await job.getState();
          this.logger.log(`[removeJobByMessageId]`, state);
          return state !== 'active' ? await job.remove() : null;
        }),
    );
  }
}
