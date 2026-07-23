import { UserModel } from "@/src/modules/auth/account/models/user.model";
import { Field, ID, ObjectType, registerEnumType } from "@nestjs/graphql";
import { TransactionStatus, type Transaction } from "@prisma/client";


registerEnumType(TransactionStatus, {
    name: 'TransactionStatus'
})

@ObjectType()
export class TransactionModel implements Transaction {
    @Field(() => ID)
    public id!: string

    @Field(() => Number)
    public amount!: number;

    @Field(() => String)
    public currency!: string;

    @Field(() => TransactionStatus)
    public status!: TransactionStatus;

    @Field(() => String)
    public stripeSubscriptionId!: string;

    @Field(() => String)
    public userId!: string;

    @Field(() => UserModel)
    public user!: UserModel

    @Field(() => Date)
    public createdAt!: Date

    @Field(() => Date)
    public updatedAt!: Date
}