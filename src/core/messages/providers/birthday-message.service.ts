import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';

import { MessageProducer } from '../../../infra/queue/message.producer';
import {
  getLuxonDate,
  getLuxonDateToString,
  getLuxonNow,
  LuxonType,
} from '../../../utils/luxon-date';
import { User } from '../../users/entities/user.entity';
import { AutomateMessageType, Message } from '../entities/message.entity';
import { MessageService } from '../message.service';

const MESSAGE_TYPE: AutomateMessageType = 'birthday';

@Injectable()
export class BirthdayMessageService {
  private readonly toSentAt: string;

  constructor(
    private readonly messageService: MessageService,
    private readonly configService: ConfigService,
    private readonly messageProducer: MessageProducer,
  ) {
    this.toSentAt = configService.get<string>(
      'BIRTHDAY_MESSAGE_TO_SEND_AT',
      '9',
    );
  }

  @OnEvent('user.created')
  async onUserCreated(user: User): Promise<void> {
    user = Object.assign(new User(), user);
    if (!this.isDateExists(user)) {
      return;
    }
    await this.createMessage(user);
  }

  @OnEvent('user.updated')
  async onUserUpdated(user: User): Promise<void> {
    await this.deleteMessage(user.id);
    if (!this.isDateExists(user)) {
      return;
    }
    await this.createMessage(user);
  }

  @OnEvent('user.deleted')
  async onUserDeleted(userId: string): Promise<void> {
    await this.deleteMessage(userId);
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
    const message = await this.getMessageWithUser(message_id, user_id);
    if (!message) {
      return;
    }

    message.resetState();

    const scheduleDate = this.getScheduleDate(message.user);
    const dto = this.prepareDto(message.user, scheduleDate);
    await this.messageService.repository.update(message_id, dto);
    await this.addToQueue(message.user, message, scheduleDate);
  }

  private isDateExists(user: User): boolean {
    // yyyy-MM-dd = 10 chars
    return user.birthday_date ? user.birthday_date.length === 10 : false;
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

  private getScheduleDate(user: User): LuxonType {
    const now = getLuxonNow(user.location);
    const date = getLuxonDate(
      user.birthday_date as string,
      this.toSentAt,
      user.location,
    ).set({
      year: now.year,
    });
    return date < now ? date.plus({ years: 1 }) : date;
  }

  private prepareDto(user: User, scheduleDate: LuxonType): Message {
    return this.messageService.repository.create({
      user_id: user.id,
      type: MESSAGE_TYPE,
      subject: 'Happy Birthday!',
      content: `Hey, ${user.full_name} it's your birthday! Happy Birthday!`,
      schedule_date: getLuxonDateToString(scheduleDate),
    });
  }

  private async addToQueue(
    user: User,
    message: Message,
    scheduleDate: LuxonType,
  ): Promise<void> {
    await this.messageProducer.addJob({
      user_id: user.id,
      user_email: user.email,
      user_location: user.location,
      message_id: message.id,
      message_type: message.type,
      message_subject: message.subject,
      message_content: message.content,
      message_delay: scheduleDate.diffNow('milliseconds').milliseconds,
    });
  }

  private async createMessage(user: User): Promise<void> {
    const scheduleDate = this.getScheduleDate(user);
    const dto = this.prepareDto(user, scheduleDate);
    const message = await this.messageService.repository.save(dto);
    await this.addToQueue(user, message, scheduleDate);
  }

  private async deleteMessage(userId: string): Promise<void> {
    const message = await this.messageService.repository.findOne({
      where: { user_id: userId, type: MESSAGE_TYPE },
      withDeleted: true,
    });
    const messageId = message ? message.id : undefined;
    await Promise.all([
      messageId && this.messageService.repository.delete(messageId),
      this.messageProducer.removeJobByUserId(userId, messageId, MESSAGE_TYPE),
    ]);
  }
}
