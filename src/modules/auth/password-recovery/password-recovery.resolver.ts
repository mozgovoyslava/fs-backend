import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { PasswordRecoveryService } from './password-recovery.service';
import { type GqlContext } from '@/src/shared/types/gql-context.types';
import { ResetPasswordInput } from '@/src/modules/auth/password-recovery/inputs/reset-password.input';
import { UserAgent } from '@/src/shared/decorators/user-agent.decorator';
import { NewPasswordInput } from '@/src/modules/auth/password-recovery/inputs/new-password.input';

@Resolver('PasswordRecovery')
export class PasswordRecoveryResolver {
    constructor(private readonly passwordRecoveryService: PasswordRecoveryService) {}


    @Mutation(() => Boolean, {name: 'ResetPassword'})
    public async resetPassword(
        @Context() {req} : GqlContext, 
        @Args('data') input: ResetPasswordInput,
        @UserAgent() userAgent: string
    ) {
        return this.passwordRecoveryService.resetPassword(req, input, userAgent);
    }


    @Mutation(() => Boolean, {name: 'NewPassword'})
    public async newPassword(
        @Args('data') input: NewPasswordInput,
    ) {
        return this.passwordRecoveryService.setNewPassword(input);
    }
}
