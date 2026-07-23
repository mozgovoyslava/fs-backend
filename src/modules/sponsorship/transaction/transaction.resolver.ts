import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { TransactionService } from './transaction.service';
import { Authorized } from '@/src/shared/decorators/authorized.decorator';
import { type User } from '@prisma/client';
import { Authorization } from '@/src/shared/decorators/auth.decorator';
import { TransactionModel } from '@/src/modules/sponsorship/transaction/models/transaction.model';
import { MakePaymentModel } from '@/src/modules/sponsorship/transaction/models/make-payment.model';

@Resolver('Transaction')
export class TransactionResolver {
    constructor(private readonly transactionService: TransactionService) {}


    @Authorization()
    @Query(() => [TransactionModel], {name: 'findMyTransactions'})
    public async findMyTransactions(
        @Authorized() user: User
    ) {
        return this.transactionService.findMyTransactions(user)
    }


    @Authorization()
    @Mutation(() => MakePaymentModel, {name: 'makeTransaction'})
    public async makeTransaction(
        @Authorized() user: User,
        @Args('planId') planId: string
    ) {
        return this.transactionService.makePayment(user, planId)
    }
}
