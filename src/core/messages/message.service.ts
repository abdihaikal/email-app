import { Repository } from 'typeorm';

import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from '../users/entities/user.entity';
import {
  ManualMessageType,
  manualMessageTypes,
  Message,
  MessageType,
} from './entities/message.entity';
import { CreateMessageDto } from './dtos/create-message.dto';
import { UpdateMessageDto } from './dtos/update-message.dto';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message) readonly repository: Repository<Message>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createMessage(dto: CreateMessageDto): Promise<Message> {
    const user = await this.userRepository.findOneBy({ id: dto.user_id });
    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    if (dto.type && !this.isValidManualType(dto.type)) {
      throw new BadRequestException(`Invalid message type`);
    } else if (!dto.type) {
      dto.type = 'regular';
    }

    const newMessage = await this.repository.save(dto);
    await Promise.all(
      this.getEventNames(newMessage.type, 'created').map((eventName) =>
        this.eventEmitter.emitAsync(eventName, newMessage),
      ),
    );
    return newMessage;
  }

  async updateMessage(id: string, dto: UpdateMessageDto): Promise<Message> {
    const oldMessage = await this.repository.findOneBy({ id });
    if (!oldMessage) {
      throw new NotFoundException(`Message not found`);
    }
    if (dto.user_id && dto.user_id !== oldMessage.user_id) {
      throw new ConflictException(`Message cannot be updated`);
    }

    if (dto.type && !this.isValidManualType(dto.type)) {
      throw new BadRequestException(`Invalid message type`);
    }

    const newDto = this.repository.merge(oldMessage, dto);
    const newMessage = await this.repository.save(newDto);
    await Promise.all(
      this.getEventNames(newMessage.type, 'updated').map((eventName) =>
        this.eventEmitter.emitAsync(eventName, newMessage, oldMessage),
      ),
    );
    return newMessage;
  }

  async deleteMessage(id: string): Promise<void> {
    const oldMessage = await this.repository.findOneBy({ id });
    if (!oldMessage) {
      throw new NotFoundException(`Message not found`);
    }

    await this.repository.softDelete(id);

    await Promise.all(
      this.getEventNames(oldMessage.type, 'deleted').map((eventName) =>
        this.eventEmitter.emitAsync(eventName, oldMessage),
      ),
    );
  }

  async getMessageById(id: string): Promise<Message> {
    const message = await this.repository.findOneBy({ id });
    if (!message) {
      throw new NotFoundException(`Message not found`);
    }
    return message;
  }

  async getMessageByUserId(user_id: string): Promise<Message[]> {
    const user = await this.userRepository.findOneBy({ id: user_id });
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    const messages = await this.repository.find({ where: { user_id } });
    if (!messages.length) {
      throw new NotFoundException(`Message not found`);
    }
    return messages;
  }

  async getMessages(): Promise<Message[]> {
    return await this.repository.find();
  }

  private isValidManualType(type: ManualMessageType): boolean {
    return manualMessageTypes.includes(type);
  }

  private getEventNames(messageType: MessageType, action: string): string[] {
    return [`message-${messageType}.${action}`, `message.${action}`].map(
      (name) => name.toLowerCase(),
    );
  }
}
