import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'

import { PrismaService } from '@/src/core/prisma/prisma.service'
import { MailService } from '@/src/modules/libs/mail/mail.service'
import { S3Service } from '@/src/modules/libs/s3/s3.service'
import { NotificationService } from '@/src/modules/notification/notification.service'

const CRON_TIME_ZONE = 'Europe/Moscow'
const MIN_FOLLOWERS_FOR_VERIFICATION = 10

@Injectable()
export class CronService {
	private readonly logger = new Logger(CronService.name)

	public constructor(
		private readonly prismaService: PrismaService,
		private readonly mailerService: MailService,
		private readonly storageService: S3Service,
		private readonly notificationService: NotificationService,
	) {}

	@Cron('0 0 * * *', { timeZone: CRON_TIME_ZONE })
	public async deleteDeactivatedAccounts() {
		const sevenDaysAgo = new Date()
		sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

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

	@Cron('0 0 * * *', { timeZone: CRON_TIME_ZONE })
	public async verifyUsers() {
		const followersCountByUser = await this.prismaService.follow.groupBy({
			by: ['followingId'],
			where: {
				follower: {
					isDeactivated: false,
				},
				following: {
					isVerified: false,
					isDeactivated: false,
				},
			},
			_count: {
				_all: true,
			},
		})

		const userIds = followersCountByUser
			.filter(({ _count }) => _count._all >= MIN_FOLLOWERS_FOR_VERIFICATION)
			.map(({ followingId }) => followingId)

		if (!userIds.length) {
			return
		}

		const users = await this.prismaService.user.findMany({
			where: {
				id: {
					in: userIds,
				},
				isVerified: false,
				isDeactivated: false,
			},
			select: {
				id: true,
			},
		})

		for (const user of users) {
			const verifiedUser = await this.prismaService.user.update({
				where: {
					id: user.id,
				},
				data: {
					isVerified: true,
				},
				include: {
					notificationSettings: true,
				},
			})

			await this.notificationService.createAccountVerified(verifiedUser)
		}

		this.logger.log(`Verified ${users.length} users by followers count`)
	}

	@Cron('0 0 * * 6', { timeZone: CRON_TIME_ZONE })
	public async recommendEnableTwoFactor() {
		const users = await this.prismaService.user.findMany({
			where: {
				isDeactivated: false,
				isTotpEnabled: false,
			},
			include: {
				notificationSettings: true,
			},
		})

		for (const user of users) {
			await this.notificationService.createEnableTwoFactorRecommendation(user)
		}

		this.logger.log(`Sent 2FA recommendation to ${users.length} users`)
	}
}
