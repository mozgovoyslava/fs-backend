import { PrismaService } from '@/src/core/prisma/prisma.service';
import { TelegramService } from '@/src/modules/libs/telegram/telegram.service';
import { ChangeNotificationsSettingsInput } from '@/src/modules/notification/inputs/change-notification-settings.input';
import { generateToken } from '@/src/shared/utils/generate-token.util';
import { Injectable } from '@nestjs/common';
import { NotificationType, type SponsorshipPlan, TokenType, type Notification, type NotificationSettings, type User } from '@prisma/client';

type NotificationRecipient = User & {
    notificationSettings?: NotificationSettings | null
}

@Injectable()
export class NotificationService {
    public constructor(
        private readonly prismaService: PrismaService,
        private readonly telegramService: TelegramService
    ) {}

    public async findUnreadCount(user: User) {
        const count = await this.prismaService.notification.count({
            where: {
                isRead: false,
                userId: user.id
            }
        })

        return count;
    }

    public async findByUser(user: User) {
        await this.prismaService.notification.updateMany({
            where: {
                isRead: false,
                userId: user.id,
            },
            data: {
                isRead: true
            }
        })

        const notifications = await this.prismaService.notification.findMany({
            where: {
                userId: user.id,
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return notifications;
    }

    public async createNewSposorship(recipientOrUserId: NotificationRecipient | string, plan: SponsorshipPlan, sponsor: User) {
        const recipient = typeof recipientOrUserId === 'string'
            ? await this.findNotificationRecipient(recipientOrUserId)
            : recipientOrUserId;

        if (!recipient) {
            return null;
        }

        let notification: Notification | null = null;

        if (this.canCreateSiteNotification(recipient)) {
            notification = await this.prismaService.notification.create({
                data: {
                    message: `У вас новый спонсор ${sponsor.username} по плану ${plan.title}`,
                    type: NotificationType.NEW_SPONSPRSHIP,
                    user: {
                        connect: {
                            id: recipient.id
                        }
                    }
                }
            })
        }

        if (this.canSendTelegramNotification(recipient)) {
            await this.telegramService.sendNewSposorship(recipient.telegramId, plan, sponsor);
        }

        return notification;
    }

    public async createAccountVerified(recipientOrUserId: NotificationRecipient | string) {
        const recipient = typeof recipientOrUserId === 'string'
            ? await this.findNotificationRecipient(recipientOrUserId)
            : recipientOrUserId;

        if (!recipient || !recipient.isVerified) {
            return null;
        }

        let notification: Notification | null = null;

        if (this.canCreateSiteNotification(recipient)) {
            notification = await this.prismaService.notification.create({
                data: {
                    message: 'Ваш аккаунт верифицирован',
                    type: NotificationType.VERIFIED_EMAIL,
                    user: {
                        connect: {
                            id: recipient.id
                        }
                    }
                }
            })
        }

        if (this.canSendTelegramNotification(recipient)) {
            await this.telegramService.sendAccountVerified(recipient.telegramId, recipient);
        }

        return notification;
    }

    public async createEnableTwoFactorRecommendation(recipientOrUserId: NotificationRecipient | string) {
        const recipient = typeof recipientOrUserId === 'string'
            ? await this.findNotificationRecipient(recipientOrUserId)
            : recipientOrUserId;

        if (!recipient || recipient.isTotpEnabled) {
            return null;
        }

        let notification: Notification | null = null;

        if (this.canCreateSiteNotification(recipient)) {
            notification = await this.prismaService.notification.create({
                data: {
                    message: 'Рекомендуем включить двухфакторную авторизацию',
                    type: NotificationType.ENABLE_TWO_FACTOR,
                    user: {
                        connect: {
                            id: recipient.id
                        }
                    }
                }
            })
        }

        if (this.canSendTelegramNotification(recipient)) {
            await this.telegramService.sendEnableTwoFactorRecommendation(recipient.telegramId);
        }

        return notification;
    }

    public async changeSettings(user: User, input: ChangeNotificationsSettingsInput) {
        const {siteNotifications, telegramNotifications} = input;

        const notificationSettings = await this.prismaService.notificationSettings.upsert({
            where: {
                userId: user.id
            },
            create: {
                siteNotifications,
                telegramNotifications,
                user: {
                    connect: {
                        id: user.id
                    }
                }
            },
            update: {
                siteNotifications,
                telegramNotifications
            },
            include: {
                user: true
            }
        })

        let telegramAuthToken: string | null = null;

        if (notificationSettings.telegramNotifications && !notificationSettings.user.telegramId) {
            const generatedTelegramAuthToken = await generateToken(this.prismaService, user, TokenType.TELEGRAM_AUTH)

            telegramAuthToken = generatedTelegramAuthToken.token
        }

        if (!notificationSettings.telegramNotifications && notificationSettings.user.telegramId) {
            await this.prismaService.user.update({
                where: {
                    id: user.id
                },
                data: {
                    telegramId: null
                }
            })

            notificationSettings.user.telegramId = null;
        }

        return {
            notificationSettings,
            telegramAuthToken
        };
    }

    public async createStreamStart(recipient: NotificationRecipient, channel: User, streamTitle?: string | null) {
        let notification: Notification | null = null;

        if (this.canCreateSiteNotification(recipient)) {
            notification = await this.prismaService.notification.create({
                data: {
                    message: `Начался стрим на канале ${channel.username}`,
                    type: NotificationType.STREAM_START,
                    user: {
                        connect: {
                            id: recipient.id
                        }
                    }
                }
            })
        }

        if (this.canSendTelegramNotification(recipient)) {
            await this.telegramService.sendStreamStart(recipient.telegramId, channel, streamTitle);
        }

        return notification;
    }

    public async createNewFollower(recipient: NotificationRecipient, follower: User) {
        let notification: Notification | null = null;

        if (this.canCreateSiteNotification(recipient)) {
            notification = await this.prismaService.notification.create({
                data: {
                    message: `У вас новый подписчик ${follower.username}`,
                    type: NotificationType.NEW_FOLLOWER,
                    user: {
                        connect: {
                            id: recipient.id
                        }
                    }
                }
            })
        }

        if (this.canSendTelegramNotification(recipient)) {
            await this.telegramService.sendNewFollower(recipient.telegramId, follower);
        }

        return notification;
    }

    private canSendTelegramNotification(user: NotificationRecipient): user is NotificationRecipient & { telegramId: string } {
        return Boolean(user.telegramId && (user.notificationSettings?.telegramNotifications ?? true));
    }

    private canCreateSiteNotification(user: NotificationRecipient) {
        return user.notificationSettings?.siteNotifications ?? true;
    }

    private async findNotificationRecipient(userId: string) {
        return this.prismaService.user.findUnique({
            where: {
                id: userId
            },
            include: {
                notificationSettings: true
            }
        })
    }
}
