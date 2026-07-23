import { Module } from '@nestjs/common'

import { FollowResolver } from './follow.resolver'
import { FollowService } from './follow.service'
import { NotificationModule } from '@/src/modules/notification/notification.module'

@Module({
	imports: [NotificationModule],
	providers: [FollowResolver, FollowService],
})
export class FollowModule {}
