import { Job } from 'bullmq';

import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { EmailServiceClient } from '../external/email-service.client';
import { MessageQueueData } from './message.producer';
import { MESSAGE_QUEUE_ID } from './queue.constant';

type MessageJob = Job<MessageQueueData>;

@Processor(MESSAGE_QUEUE_ID, {
  concurrency: 5,
  limiter: {
    max: 10,
    duration: 1000,
  },
})
export class MessageConsumer extends WorkerHost {
  private readonly logger = new Logger(MessageConsumer.name);

  constructor(
    private readonly emailService: EmailServiceClient,
    private readonly eventEmitter: EventEmitter2,
  ) {
    super();
  }

  async process(job: MessageJob): Promise<void> {
    const { user_email, message_subject, message_content } = job.data;
    await this.emailService.send({
      email: user_email,
      subject: message_subject,
      message: message_content || '',
    });
  }

  private getEventNames(messageType: string, action: string): string[] {
    return [
      `sent-message-${messageType}.${action}`,
      `sent-message.${action}`,
    ].map((name) => name.toLowerCase());
  }

  private async emitEvent(job: MessageJob, action: string): Promise<void> {
    const {
      user_id,
      message_id,
      message_type,
      message_delay,
      queue_id,
      queue_name,
    } = job.data;
    await Promise.all(
      this.getEventNames(job.data.message_type, action).map((eventName) =>
        this.eventEmitter.emitAsync(
          eventName,
          user_id,
          message_id,
          message_type,
          message_delay,
          queue_id,
          queue_name,
        ),
      ),
    );
  }

  @OnWorkerEvent('active')
  async onActive(job: MessageJob): Promise<void> {
    this.logger.log('[onActive]');
    await this.emitEvent(job, 'active');
  }

  @OnWorkerEvent('failed')
  async onFailed(job: MessageJob): Promise<void> {
    this.logger.log('[onFailed]');
    await this.emitEvent(job, 'failed');
  }

  @OnWorkerEvent('completed')
  async onCompleted(job: MessageJob): Promise<void> {
    this.logger.log('[onCompleted]');
    await this.emitEvent(job, 'completed');
  }

  // @OnWorkerEvent('closed')
  // async onClosed(): Promise<void> {
  //   this.logger.log('[onClosed]');
  // }

  // @OnWorkerEvent('closing')
  // async onClosing(): Promise<void> {
  //   this.logger.log('[onClosing]');
  // }

  // @OnWorkerEvent('drained')
  // async onDrained(): Promise<void> {
  //   this.logger.log('[onDrained]');
  // }

  // @OnWorkerEvent('error')
  // async onError(): Promise<void> {
  //   this.logger.log('[onError]');
  // }

  // @OnWorkerEvent('paused')
  // async onPaused(): Promise<void> {
  //   this.logger.log('[onPaused]');
  // }

  // @OnWorkerEvent('progress')
  // async onProgress(): Promise<void> {
  //   this.logger.log('[onProgress]');
  // }

  // @OnWorkerEvent('ready')
  // async onReady(): Promise<void> {
  //   this.logger.log('[onReady]');
  // }

  // @OnWorkerEvent('resumed')
  // async onResumed(): Promise<void> {
  //   this.logger.log('[onResumed]');
  // }

  // @OnWorkerEvent('stalled')
  // async onStalled(): Promise<void> {
  //   this.logger.log('[onStalled]');
  // }
}
