import { PrismaService } from '@/src/core/prisma/prisma.service';
import { TelegramMessage } from '@/src/modules/libs/telegram/telegram.message';
import { Injectable, Logger } from '@nestjs/common';
import { type SponsorshipPlan, TokenType, type Prisma, type User } from '@prisma/client';
import { Command, Ctx, InjectBot, Start, Update } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import type { Context, NarrowedContext, Types } from 'telegraf';

type StartContext = NarrowedContext<Context, Types.MountMap['text']> & Types.CommandContextExtn;
type TelegramUser = Prisma.UserGetPayload<{
    include: {
        followers: true
        followings: true
    }
}>

@Update()
@Injectable()
export class TelegramService {
    private readonly logger = new Logger(TelegramService.name);

    public constructor(
        private readonly prismaService: PrismaService,
        @InjectBot() private readonly bot: Telegraf<Context>
    ) {}

    @Start()
    public async onStart(@Ctx() ctx: StartContext) {
        const chatId = ctx.chat?.id?.toString();
        const token = ctx.payload.trim();

        if (!chatId) {
            await ctx.replyWithHTML(TelegramMessage.chatNotFound());
            return;
        }

        if (!token) {
            const user = await this.findUserByChatId(chatId);

            if (user) {
                await this.onMe(ctx, user);
                await ctx.replyWithHTML(TelegramMessage.welcomeBack());
                return;
            }

            await ctx.replyWithHTML(TelegramMessage.connectTelegram());
            return;
        }

        const authToken = await this.prismaService.token.findFirst({
            where: {
                token,
                type: TokenType.TELEGRAM_AUTH
            }
        })

        if (!authToken || authToken.expiresIn < new Date()) {
            await ctx.replyWithHTML(TelegramMessage.invalidToken());
            return;
        }

        await this.connectTelegram(authToken.userId, chatId, authToken.id);

        await ctx.replyWithHTML(TelegramMessage.connected());
    }

    @Command('me')
    public async onMe(@Ctx() ctx: Context, user?: TelegramUser) {
        const chatId = ctx.chat?.id?.toString();

        if (!chatId) {
            await ctx.replyWithHTML(TelegramMessage.chatNotFound());
            return;
        }

        const currentUser = user ?? await this.findUserByChatId(chatId);

        if (!currentUser) {
            await ctx.replyWithHTML(TelegramMessage.notConnected());
            return;
        }

        await ctx.replyWithHTML(TelegramMessage.accountInfo(currentUser))
    }

    public async sendStreamStart(chatId: string, channel: User, streamTitle?: string | null) {
        await this.sendHtml(
            chatId,
            TelegramMessage.streamStarted(channel, streamTitle)
        );
    }

    public async sendNewFollower(chatId: string, follower: User) {
        await this.sendHtml(
            chatId,
            TelegramMessage.newFollower(follower)
        );
    }

    public async sendNewSposorship(chatId: string, plan: SponsorshipPlan, sponsor: User) {
        await this.sendHtml(
            chatId,
            TelegramMessage.newSponsorship(plan, sponsor)
        );
    }

    public async sendAccountVerified(chatId: string, user: User) {
        await this.sendHtml(
            chatId,
            TelegramMessage.accountVerified(user)
        );
    }

    public async sendEnableTwoFactorRecommendation(chatId: string) {
        await this.sendHtml(
            chatId,
            TelegramMessage.enableTwoFactor()
        );
    }

    private async connectTelegram(userId: string, chatId: string, tokenId: string) {
        await this.prismaService.$transaction([
            this.prismaService.user.update({
                where: {
                    id: userId,
                },
                data: {
                    telegramId: chatId
                }
            }),
            this.prismaService.token.delete({
                where: {
                    id: tokenId
                }
            })
        ]);
    }

    private async findUserByChatId(chatId: string) {
        return this.prismaService.user.findUnique({
            where: {
                telegramId: chatId,
            },
            include: {
                followers: true,
                followings: true
            }
        })
    }

    private async sendHtml(chatId: string, message: string) {
        try {
            await this.bot.telegram.sendMessage(chatId, message, {
                parse_mode: 'HTML'
            });
        } catch (error) {
            this.logger.error(`Failed to send Telegram message to chat ${chatId}`, error);
        }
    }
}
