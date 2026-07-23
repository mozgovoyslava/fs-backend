import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationResolver } from './notification.resolver';
import { TelegramModule } from '@/src/modules/libs/telegram/telegram.module';

@Module({
  imports: [TelegramModule],
  providers: [NotificationResolver, NotificationService],
  exports: [NotificationService]
})
export class NotificationModule {}
