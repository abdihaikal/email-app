import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

import { ApiProperty, PartialType } from '@nestjs/swagger';

import { MessageStatus } from '../entities/message.entity';
import { CreateMessageDto } from './create-message.dto';

export class UpdateMessageDto extends PartialType(CreateMessageDto) {
  @ApiProperty({
    description: 'Message status: pending, processing, sent, failed',
    example: 'pending',
    default: 'pending',
    required: false,
  })
  @IsString()
  @IsOptional()
  status?: MessageStatus;

  @ApiProperty({
    description: 'Last attempt at',
    example: '2023-01-01T00:00:00.000Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  last_attempt_at?: string;

  @ApiProperty({
    description: 'Retries attempted',
    example: 0,
    default: 0,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  retries_attempted?: number;
}
