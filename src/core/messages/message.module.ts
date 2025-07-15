import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { QueueModule } from '../../infra/queue/queue.module';
import { UserModule } from '../users/user.module';
import { Message } from './entities/message.entity';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { AnniversaryMessageService } from './providers/anniversary-message.service';
import { BirthdayMessageService } from './providers/birthday-message.service';
import { RegularMessageService } from './providers/regular-message.service';

@Module({
  imports: [TypeOrmModule.forFeature([Message]), UserModule, QueueModule],
  controllers: [MessageController],
  providers: [
    MessageService,

    // Providers
    RegularMessageService,
    BirthdayMessageService,
    AnniversaryMessageService,
  ],
  exports: [TypeOrmModule, MessageService],
})
export class MessageModule {}
