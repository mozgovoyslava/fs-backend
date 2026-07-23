import { Module } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'

import { S3Module } from '@/src/modules/libs/s3/s3.module'
import { NotificationModule } from '@/src/modules/notification/notification.module'

import { CronService } from './cron.service'

@Module({
	imports: [ScheduleModule.forRoot(), S3Module, NotificationModule],
	providers: [CronService],
})
export class CronModule {}
