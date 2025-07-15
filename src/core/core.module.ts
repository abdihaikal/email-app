import { Module } from '@nestjs/common';

import { MessageModule } from './messages/message.module';
import { UserModule } from './users/user.module';

@Module({
  imports: [UserModule, MessageModule],
  exports: [UserModule, MessageModule],
})
export class CoreModule {}
