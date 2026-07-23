import { Query, Resolver } from '@nestjs/graphql';
import { SubscriptionService } from './subscription.service';
import { Authorization } from '@/src/shared/decorators/auth.decorator';
import { Authorized } from '@/src/shared/decorators/authorized.decorator';
import { type User } from '@prisma/client';
import { SubscriptionModel } from '@/src/modules/sponsorship/subscription/models/subsctiption.model';

@Resolver('Subscription')
export class SubscriptionResolver {
    constructor(private readonly subscriptionService: SubscriptionService) {}


    @Authorization()
    @Query(() => [SubscriptionModel], {name: "findMySubscriptions"})
    public async findMySubscriptions(
        @Authorized() user: User,
    ) {
        return this.subscriptionService.findMySponsors(user)
    }
}
