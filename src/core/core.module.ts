import { Module } from '@nestjs/common'

import { PrismaModule } from './prisma/prisma.module'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { IS_DEV_ENV } from '@/src/shared/utils/is-dev.util'
import { GraphQLModule } from '@nestjs/graphql'
import { ApolloDriver } from '@nestjs/apollo'
import { getGraphQLConfig } from '@/src/core/config/graphql.config'
import { RedisModule } from './redis/redis.module';
import { AccountModule } from '@/src/modules/auth/account/account.module'
import { SessionModule } from '@/src/modules/auth/session/session.module'
import { VerificationModule } from '@/src/modules/auth/verification/verification.module'
import { PasswordRecoveryModule } from '@/src/modules/auth/password-recovery/password-recovery.module'
import { MailModule } from '@/src/modules/libs/mail/mail.module'
import { TotpModule } from '@/src/modules/auth/totp/totp.module'
import { DeactivateModule } from '@/src/modules/auth/deactivate/deactivate.module'
import { CronModule } from '@/src/modules/cron/cron.module'
import { S3Module } from '@/src/modules/libs/s3/s3.module'

@Module({
	imports: [
		ConfigModule.forRoot({
			ignoreEnvFile: !IS_DEV_ENV,
			isGlobal: true,
			expandVariables: true
		}),
		GraphQLModule.forRootAsync({
			driver: ApolloDriver,
			imports: [ConfigModule],
			useFactory: getGraphQLConfig,
			inject: [ConfigService] 
		}),
		MailModule,
		S3Module,
		PrismaModule,
		RedisModule,
		CronModule,
		AccountModule,
		SessionModule,
		VerificationModule,
		PasswordRecoveryModule,
		TotpModule,
		DeactivateModule
	],
	controllers: [],
	providers: [],
})
export class CoreModule {}
