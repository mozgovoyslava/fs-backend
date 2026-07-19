import { Field, ID, ObjectType } from '@nestjs/graphql'
import type { SocialLink, User } from '@prisma/client'

@ObjectType()
export class SocialLinkModel implements SocialLink {
	@Field(() => ID)
	public id!: string

	@Field(() => String)
	title!: string

	@Field(() => String)
	url!: string

	@Field(() => Number)
	position!: number

	@Field(() => String)
	userId!: string

	@Field(() => Date)
	public createdAt!: Date

	@Field(() => Date)
	public updatedAt!: Date
}
