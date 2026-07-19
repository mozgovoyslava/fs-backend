import { type MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common'

import { RawBodyMidleware } from '@/src/shared/midlewares/raw-body.midleware'

import { WebhookController } from './webhook.controller'
import { WebhookService } from './webhook.service'

@Module({
	controllers: [WebhookController],
	providers: [WebhookService],
})
export class WebhookModule {
	public configure(consumer: MiddlewareConsumer) {
		consumer
			.apply(RawBodyMidleware)
			.forRoutes({ path: 'webhook/livekit', method: RequestMethod.POST })
	}
}
