import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

import { ManualMessageType } from '../entities/message.entity';

export class CreateMessageDto {
  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-4266',
    required: true,
  })
  @IsUUID()
  @IsNotEmpty()
  user_id: string;

  @ApiProperty({
    description: 'Message type',
    example: 'regular',
    default: 'regular',
    required: false,
  })
  @IsString()
  @IsOptional()
  type?: ManualMessageType;

  @ApiProperty({
    description: 'Message subject',
    example: 'Regular message',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({
    description: 'Message content',
    example: 'Hi, this is your regular message',
    required: false,
  })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({
    description: 'Message schedule Date. Format: YYYY-MM-DD',
    example: '2023-01-01',
    default: null,
    required: false,
  })
  @IsDateString()
  @IsOptional()
  schedule_date?: string;
}
