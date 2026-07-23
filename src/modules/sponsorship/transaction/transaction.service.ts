import { PrismaService } from '@/src/core/prisma/prisma.service';
import { StripeService } from '@/src/modules/libs/stripe/stripe.service';
import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { type User } from '@prisma/client';

@Injectable()
export class TransactionService {


    public constructor(
        private readonly prismaService: PrismaService,
        private readonly configService: ConfigService,
        private readonly stripeService: StripeService,
    ) {}


    public async findMyTransactions(user: User) {
        const transactions = await this.prismaService.transaction.findMany({
            where: {
                userId: user.id
            }
        })

        return transactions;
    }


    public async makePayment(user: User, planId: string) {
        const plan = await this.prismaService.sponsorshipPlan.findUnique({
            where: {
                id: planId
            },
            include: {
                channel: true
            }
        })

        if (!plan) {
            throw new NotFoundException("План не найден");
        }

        if (user.id === plan.channel?.id) {
            throw new ConflictException('Нельзя оформить спонсорство на себя');
        }

        const existingSubscription = await this.prismaService.sponsorshipSubscription.findFirst({
            where: {
                userId: user.id,
                channelId: plan.channel?.id,
            }
        })

        if (existingSubscription) {
            throw new ConflictException('Вы уже подписаны')
        }

        const customer = await this.stripeService.customers.create({
            name: user.username,
            email: user.email
        });

        const session = await this.stripeService.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'rub',
                        product_data: {
                            name: plan.title,
                            description: plan.description ?? '',
                            
                        },
                        unit_amount: Math.round(plan.price * 100),
                        recurring: {
                            interval: 'month'
                        },
                    },
                    quantity: 1
                }
            ],
            mode: 'subscription',
            success_url: `http://localhost:3000`,
            cancel_url: `http://localhost:3000`,
            customer: customer.id,
            metadata: {
                planId: plan.id,
                userId: user.id,
                channelId: plan.channelId
            }
        })

        if (!session || !session.currency) {
            throw new InternalServerErrorException('Ошибка создания сессии платежа');
        }

        await this.prismaService.transaction.create({
            data: {
                amount: plan.price,
                currency: session.currency,
                stripeSubscriptionId: session.id,
                user: {
                    connect: {
                        id: user.id
                    }
                }
            }
        })

        return {url: session.url };
    }
}
