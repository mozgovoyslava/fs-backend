import { Injectable } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'

import { PrismaService } from '@/src/core/prisma/prisma.service'
import { MailService } from '@/src/modules/libs/mail/mail.service'
import { S3Service } from '@/src/modules/libs/s3/s3.service'

@Injectable()
export class CronService {
	public constructor(
		private readonly prismaService: PrismaService,
		private readonly mailerService: MailService,
		private readonly storageService: S3Service,
	) {}

	@Cron('0 0 * * *')
	public async deleteDeactivatedAccounts() {
		const sevenDaysAgo = new Date()
		sevenDaysAgo.setDate(sevenDaysAgo.getDay() - 7)

		const deactivatedAccounts = await this.prismaService.user.findMany({
			where: {
				isDeactivated: true,
				deactivatedAt: {
					lte: sevenDaysAgo,
				},
			},
		})

		for (const user of deactivatedAccounts) {
			await this.mailerService.sendAccountDeletion(user.email, new Date())

			if (user.avatar) {
				await this.storageService.remove(user.avatar)
			}
		}

		await this.prismaService.user.deleteMany({
			where: {
				isDeactivated: true,
				deactivatedAt: {
					lte: sevenDaysAgo,
				},
			},
		})
	}
}
