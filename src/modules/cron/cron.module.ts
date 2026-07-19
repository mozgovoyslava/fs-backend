import { Module } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'

import { S3Module } from '@/src/modules/libs/s3/s3.module'

import { CronService } from './cron.service'

@Module({
	imports: [ScheduleModule.forRoot(), S3Module],
	providers: [CronService],
})
export class CronModule {}
