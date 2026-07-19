import { Module } from '@nestjs/common'

import { S3Module } from '@/src/modules/libs/s3/s3.module'

import { ProfileResolver } from './profile.resolver'
import { ProfileService } from './profile.service'

@Module({
	imports: [S3Module],
	providers: [ProfileResolver, ProfileService],
})
export class ProfileModule {}
