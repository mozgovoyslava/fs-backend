import { type MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common'

import { RawBodyMidleware } from '@/src/shared/midlewares/raw-body.midleware'

import { WebhookController } from './webhook.controller'
import { WebhookService } from './webhook.service'
import { NotificationModule } from '@/src/modules/notification/notification.module'

@Module({
	imports: [NotificationModule],
	controllers: [WebhookController],
	providers: [WebhookService],
})
export class WebhookModule {
	public configure(consumer: MiddlewareConsumer) {
		consumer
			.apply(RawBodyMidleware)
			.forRoutes(
				{ path: 'webhook/livekit', method: RequestMethod.POST },
				{ path: 'webhook/stripe', method: RequestMethod.POST }
			)
	}
}
