import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';

import { MessageProducer } from '../../../infra/queue/message.producer';
import {
  getLuxonDate,
  getLuxonDateToString,
  getLuxonDiffToNow,
  getLuxonNow,
  LuxonType,
} from '../../../utils/luxon-date';
import { ManualMessageType, Message } from '../entities/message.entity';
import { MessageService } from '../message.service';

const MESSAGE_TYPE: ManualMessageType = 'regular';

@Injectable()
export class RegularMessageService {
  constructor(
    private readonly messageService: MessageService,
    private readonly configService: ConfigService,
    private readonly messageProducer: MessageProducer,
  ) {}

  @OnEvent(`message-${MESSAGE_TYPE}.created`)
  async onMessageCreated(message: Message): Promise<void> {
    if (!message.user) {
      message = (await this.getMessageWithUser(message.id)) as Message;
    }

    let scheduleDate: LuxonType | undefined;
    if (message.schedule_date) {
      scheduleDate = this.getScheduleDate(message);
      message = this.messageService.repository.merge(message, {
        schedule_date: getLuxonDateToString(scheduleDate),
      });
      await this.messageService.repository.update(message.id, message);
    }

    await this.addToQueue(message, scheduleDate);
  }

  @OnEvent(`message-${MESSAGE_TYPE}.updated`)
  async onMessageUpdated(message: Message, oldMessage: Message): Promise<void> {
    if (!message.user) {
      message = (await this.getMessageWithUser(message.id)) as Message;
    }

    await this.messageProducer.removeJobByMessageId(message.id, MESSAGE_TYPE);

    let scheduleDate: LuxonType | undefined;
    if (message.schedule_date !== oldMessage.schedule_date) {
      if (message.schedule_date && message.schedule_date.length) {
        scheduleDate = this.getScheduleDate(message);
      }
      message = this.messageService.repository.merge(message, {
        schedule_date: scheduleDate
          ? getLuxonDateToString(scheduleDate)
          : undefined,
      });

      await this.messageService.repository.update(message.id, message);
    }

    await this.addToQueue(message, scheduleDate);
  }

  @OnEvent(`message-${MESSAGE_TYPE}.deleted`)
  async onMessageDeleted(message: Message): Promise<void> {
    await this.messageProducer.removeJobByMessageId(message.id, MESSAGE_TYPE);
  }

  @OnEvent(`sent-message-${MESSAGE_TYPE}.active`)
  async onSentMessageActive(
    user_id: string,
    message_id: string,
  ): Promise<void> {
    await this.messageService.repository.update(message_id, {
      status: 'processing',
      last_attempt_at: getLuxonNow().toJSDate(),
    });
  }

  @OnEvent(`sent-message-${MESSAGE_TYPE}.failed`)
  async onSentMessageFailed(
    user_id: string,
    message_id: string,
  ): Promise<void> {
    const message = await this.getMessageWithUser(message_id, user_id);
    if (!message) {
      return;
    }
    await this.messageService.repository.update(message_id, {
      status: 'failed',
      retries_attempted: message.retries_attempted + 1,
    });
  }

  @OnEvent(`sent-message-${MESSAGE_TYPE}.completed`)
  async onSentMessageCompleted(
    user_id: string,
    message_id: string,
  ): Promise<void> {
    await this.messageService.repository.update(message_id, {
      status: 'sent',
    });
  }

  private async getMessageWithUser(
    id: string,
    user_id?: string,
  ): Promise<Message | null> {
    return await this.messageService.repository.findOne({
      where: { id, user_id },
      relations: { user: true },
    });
  }

  private getScheduleDate(message: Message): LuxonType {
    const location = message.user.location;
    const now = getLuxonNow(location);
    const date = getLuxonDate(
      message.schedule_date as string,
      undefined,
      location,
    );
    return date < now
      ? date.plus({ seconds: getLuxonDiffToNow(date, 'seconds') + 30 })
      : date;
  }

  private async addToQueue(
    message: Message,
    scheduleDate?: LuxonType,
  ): Promise<void> {
    await this.messageProducer.addJob({
      user_id: message.user.id,
      user_email: message.user.email,
      user_location: message.user.location,
      message_id: message.id,
      message_type: message.type,
      message_subject: message.subject,
      message_content: message.content,
      message_delay: scheduleDate
        ? scheduleDate.diffNow('milliseconds').milliseconds
        : 0,
    });
  }
}
