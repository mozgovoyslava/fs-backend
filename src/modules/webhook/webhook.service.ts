import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { TransactionStatus } from '@prisma/client'
import Stripe from 'stripe'

import { PrismaService } from '@/src/core/prisma/prisma.service'
import { LivekitService } from '@/src/modules/libs/livekit/livekit.service'
import { StripeService } from '@/src/modules/libs/stripe/stripe.service'
import { NotificationService } from '@/src/modules/notification/notification.service'

@Injectable()
export class WebhookService {
	private readonly logger = new Logger(WebhookService.name)

	constructor(
		private readonly prismaService: PrismaService,
		private readonly livekitService: LivekitService,
		private readonly stripeService: StripeService,
		private readonly configService: ConfigService,
		private readonly notificationService: NotificationService
	) {}

	public async receiveWebhookLivekit(body: string, authorization: string) {
		const event = await this.livekitService.receiver.receive(
			body,
			authorization,
			true,
		)

		if (event.event === 'ingress_started') {
			const stream = await this.prismaService.stream.update({
				where: {
					ingressId: event.ingressInfo?.ingressId,
				},
				data: {
					isLive: true,
				},
				include: {
					user: true,
				}
			})

			const followers = await this.prismaService.follow.findMany({
				where: {
					followingId: stream.user.id,
					follower: {
						isDeactivated: false
					}
				},
				include: {
					follower: {
						include: {
							notificationSettings: true
						}
					}
				}
			})

			for (const follow of followers) {
				const follower = follow.follower;

				await this.notificationService.createStreamStart(follower, stream.user, stream.title)
			} 
		}

		if (event.event === 'ingress_ended') {
			const stream = await this.prismaService.stream.update({
				where: {
					ingressId: event.ingressInfo?.ingressId,
				},
				data: {
					isLive: false,
				},
			})

			await this.prismaService.chatMessage.deleteMany({
				where: {
					streamId: stream.id
				}
			})
		}
	}

	public async receiveWebhookStripe(body: string, signature: string) {
		const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');

		if (!webhookSecret) {
			throw new BadRequestException('Не настроен Stripe webhook secret')
		}

		let event: Stripe.Event;

		try {
			event = this.stripeService.webhooks.constructEvent(
				body,
				signature,
				webhookSecret
			);
		} catch (error) {
			throw new BadRequestException('Невалидная подпись Stripe webhook')
		}

		if (event.type === 'checkout.session.completed') {
			await this.handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
		}

		return true;
	}

	private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
		const planId = session.metadata?.planId;
		const userId = session.metadata?.userId;
		const channelId = session.metadata?.channelId;

		if (!planId || !userId || !channelId) {
			this.logger.warn(`Stripe checkout session ${session.id} received without required metadata`)
			return;
		}

		const transaction = await this.prismaService.transaction.findFirst({
			where: {
				stripeSubscriptionId: session.id
			}
		})

		if (transaction?.status === TransactionStatus.SUCCESS) {
			return;
		}

		const [plan, sponsor, existingSubscription] = await Promise.all([
			this.prismaService.sponsorshipPlan.findUnique({
				where: {
					id: planId
				},
				include: {
					channel: {
						include: {
							notificationSettings: true
						}
					}
				}
			}),
			this.prismaService.user.findUnique({
				where: {
					id: userId
				}
			}),
			this.prismaService.sponsorshipSubscription.findFirst({
				where: {
					userId,
					channelId
				}
			})
		])

		if (!plan?.channel || !sponsor) {
			this.logger.warn(`Stripe checkout session ${session.id} references missing plan, channel, or sponsor`)
			return;
		}

		const channel = plan.channel;
		const expiresAt = this.getNextMonthDate();

		await this.prismaService.$transaction(async tx => {
			if (transaction) {
				await tx.transaction.update({
					where: {
						id: transaction.id
					},
					data: {
						status: TransactionStatus.SUCCESS
					}
				})
			}

			if (existingSubscription) {
				await tx.sponsorshipSubscription.update({
					where: {
						id: existingSubscription.id
					},
					data: {
						expiresAt,
						plan: {
							connect: {
								id: plan.id
							}
						}
					}
				})

				return;
			}

			await tx.sponsorshipSubscription.create({
				data: {
					expiresAt,
					plan: {
						connect: {
							id: plan.id
						}
					},
					user: {
						connect: {
							id: sponsor.id
						}
					},
					channel: {
						connect: {
							id: channel.id
						}
					}
				}
			})
		})

		if (!existingSubscription) {
			await this.notificationService.createNewSposorship(channel, plan, sponsor);
		}
	}

	private getNextMonthDate() {
		const expiresAt = new Date();
		expiresAt.setMonth(expiresAt.getMonth() + 1);

		return expiresAt;
	}
}
