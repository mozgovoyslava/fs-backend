import { PrismaService } from '@/src/core/prisma/prisma.service';
import { StripeService } from '@/src/modules/libs/stripe/stripe.service';
import { CreatePlanInput } from '@/src/modules/sponsorship/plan/inputs/create-plan.input';
import { ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { type User } from '@prisma/client';

@Injectable()
export class PlanService {

    constructor(
        private readonly prismaService: PrismaService,
        private readonly stripeService: StripeService
    ) {}


    public async findMyPlans (user: User) {
        const plans = await this.prismaService.sponsorshipPlan.findMany({
            where: {
                channelId: user.id
            }
        })

        return plans;
    }

    public async create(user: User, input: CreatePlanInput) {
        const {title, description, price} = input;

        const channel = await this.prismaService.user.findUnique({
            where: {
                id: user.id,
            }
        });

        if (!channel?.isVerified) {
            throw new ForbiddenException('План могу создать верефицированные пользователи')
        }

        const stripePlan = await this.stripeService.plans.create({
            amount: Math.round(price * 100),
            currency: 'rub',
            interval: 'month',
            product: {
                name: title
            }
        });

        if (!stripePlan || !stripePlan.product) {
            throw new InternalServerErrorException('Ошбика создания плана в страйп');
        }

        await this.prismaService.sponsorshipPlan.create({
            data: {
                title,
                description,
                price,
                stripeProductId: stripePlan.product.toString(),
                stripePlanId: stripePlan.id,
                channel: {
                    connect: {
                        id: user.id
                    }
                }
            }
        })

        return true;
    }

    public async remove(planId: string) {
        const plan = await this.prismaService.sponsorshipPlan.findUnique({
            where: {
                id: planId,
            }
        })

        if (!plan) {
            throw new NotFoundException('План не найден');
        }

        await this.stripeService.plans.del(plan.stripePlanId);
        await this.stripeService.products.del(plan.stripeProductId);

        await this.prismaService.sponsorshipPlan.delete({
            where: {
                id: plan.id
            }
        })

        return true;
    }

}
