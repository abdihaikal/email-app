import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

import { CustomParseUUIDPipe } from '../utils/custom-parse-uuid.pipe';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dtos/create-message.dto';
import { MessageResponseDto } from './dtos/message-response.dto';
import { UpdateMessageDto } from './dtos/update-message.dto';
import { MessageService } from './message.service';

@Controller({ path: 'messages' })
export class MessageController {
  constructor(private readonly service: MessageService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new message' })
  @ApiBody({ type: CreateMessageDto })
  @ApiResponse({
    status: 201,
    description: 'The message has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async createMessage(
    @Body() dto: CreateMessageDto,
  ): Promise<MessageResponseDto> {
    const message = await this.service.createMessage(dto);
    return this.mapToResponseDto(message);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing message' })
  @ApiParam({
    name: 'id',
    description: 'The id of the message',
    type: 'string',
    format: 'uuid',
    required: true,
  })
  @ApiBody({ type: UpdateMessageDto })
  @ApiResponse({
    status: 200,
    description: 'The message has been successfully updated.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updateMessage(
    @Param('id', CustomParseUUIDPipe) id: string,
    @Body() dto: UpdateMessageDto,
  ): Promise<MessageResponseDto> {
    const message = await this.service.updateMessage(id, dto);
    return this.mapToResponseDto(message);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an existing message' })
  @ApiParam({
    name: 'id',
    description: 'The id of the message',
    type: 'string',
    format: 'uuid',
    required: true,
  })
  @ApiResponse({
    status: 204,
    description: 'The message has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async deleteMessage(
    @Param('id', CustomParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.service.deleteMessage(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a message by id' })
  @ApiParam({
    name: 'id',
    description: 'The id of the message',
    type: 'string',
    format: 'uuid',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'The message has been successfully retrieved.',
  })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getMessageById(
    @Param('id', CustomParseUUIDPipe) id: string,
  ): Promise<MessageResponseDto> {
    const message = await this.service.getMessageById(id);
    return this.mapToResponseDto(message);
  }

  @Get('user/:id')
  @ApiOperation({ summary: 'Get all messages by user id' })
  @ApiParam({
    name: 'id',
    description: 'The user id to retrieve messages for',
    type: 'string',
    format: 'uuid',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'The messages have been successfully retrieved.',
  })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getMessageByUserId(
    @Param('id', CustomParseUUIDPipe) id: string,
  ): Promise<MessageResponseDto[]> {
    const messages = await this.service.getMessageByUserId(id);
    return messages.map((message) => this.mapToResponseDto(message));
  }

  @Get()
  @ApiOperation({ summary: 'Get all messages' })
  @ApiResponse({
    status: 200,
    description: 'The messages have been successfully retrieved.',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getMessages(): Promise<MessageResponseDto[]> {
    const messages = await this.service.getMessages();
    return messages.map((message) => this.mapToResponseDto(message));
  }

  private mapToResponseDto(message: Message): MessageResponseDto {
    message = this.service.repository.create(message);
    return {
      id: message.id,
      userID: message.user_id,
      messageType: message.type,
      messageSubject: message.subject,
      messageContent: message.content,
      messageScheduleDate: message.schedule_date,
      messageStatus: message.status,
      lastAttemptAt: message.last_attempt_at,
      retriesAttempted: message.retries_attempted,
      createdAt: message.created_at,
      updatedAt: message.updated_at,
    };
  }
}
