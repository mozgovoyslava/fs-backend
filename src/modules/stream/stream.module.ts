import { Module } from '@nestjs/common'

import { S3Module } from '@/src/modules/libs/s3/s3.module'

import { IngressModule } from './ingress/ingress.module'
import { StreamResolver } from './stream.resolver'
import { StreamService } from './stream.service'

@Module({
	imports: [S3Module, IngressModule],
	providers: [StreamResolver, StreamService],
})
export class StreamModule {}
