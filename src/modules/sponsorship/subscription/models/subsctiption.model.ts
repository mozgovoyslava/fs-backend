import { UserModel } from "@/src/modules/auth/account/models/user.model";
import { PlanModel } from "@/src/modules/sponsorship/plan/models/plan.model";
import { Field, ID, ObjectType } from "@nestjs/graphql";
import { type SponsorshipSubscription } from "@prisma/client";



@ObjectType()
export class SubscriptionModel implements SponsorshipSubscription {
    @Field(() => ID)
    public id!: string

    @Field(() => String)
    userId!: string;

    @Field(() => UserModel)
    user!: UserModel;

    @Field(() => String)
    channelId!: string;

    @Field(() => UserModel)
    channel!: UserModel;

    @Field(() => String)
    planId!: string;

    @Field(() => PlanModel)
    plan!: PlanModel;

    @Field(() => Date)
    expiresAt!: Date;

    @Field(() => Date)
    public createdAt!: Date

    @Field(() => Date)
    public updatedAt!: Date
}