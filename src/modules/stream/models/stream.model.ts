import { Field, ID, ObjectType } from '@nestjs/graphql'
import type { Stream } from '@prisma/client'

import { UserModel } from '@/src/modules/auth/account/models/user.model'
import { CategoryModel } from '@/src/modules/category/models/category.model'
import { ChatMessageModel } from '@/src/modules/chat/models/chat-message.model'

@ObjectType()
export class StreamModel implements Stream {
	@Field(() => ID)
	public id!: string

	@Field(() => Boolean)
	isLive!: boolean

	@Field(() => Boolean)
	isChatEnabled!: boolean

	@Field(() => Boolean)
	isChatFollowersOnly!: boolean

	@Field(() => Boolean)
	isChatPremiumFollowersOnly!: boolean

	@Field(() => [ChatMessageModel])
	chatMessages!: ChatMessageModel[]

	@Field(() => String)
	title!: string

	@Field(() => String, { nullable: true })
	streamKey!: string | null

	@Field(() => String, { nullable: true })
	serverUrl!: string | null

	@Field(() => String, { nullable: true })
	ingressId!: string | null

	@Field(() => String, { nullable: true })
	thumbnailUrl!: string | null

	@Field(() => UserModel)
	user!: UserModel

	@Field(() => String)
	userId!: string

	@Field(() => String, { nullable: true })
	categoryId!: string | null

	@Field(() => CategoryModel, { nullable: true })
	category!: CategoryModel | null

	@Field(() => Date)
	public createdAt!: Date

	@Field(() => Date)
	public updatedAt!: Date
}
