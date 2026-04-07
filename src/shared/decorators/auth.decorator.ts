import { GqlAuthGuard } from "@/src/shared/guards/gql-auth.guard";
import { applyDecorators, UseGuards } from "@nestjs/common";

export function Authorization() {
    return applyDecorators(UseGuards(GqlAuthGuard))
}