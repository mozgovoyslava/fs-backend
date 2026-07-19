import { createParamDecorator, type ExecutionContext } from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'
import { Request } from 'express'

export const UserAgent = createParamDecorator(
	(data: unknown, ctx: ExecutionContext) => {
		if (ctx.getType() === 'http') {
			const request: Request = ctx.switchToHttp().getRequest()

			return request.headers['user-agent']
		} else {
			const context = GqlExecutionContext.create(ctx)

			return context.getContext().req.headers['user-agent']
		}
	},
)
