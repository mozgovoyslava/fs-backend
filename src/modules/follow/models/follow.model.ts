import { Field, ID, ObjectType } from '@nestjs/graphql'
import type { Follow } from '@prisma/client'

import { UserModel } from '@/src/modules/auth/account/models/user.model'
import { StreamModel } from '@/src/modules/stream/models/stream.model'

@ObjectType()
export class FollowModel implements Follow {
	@Field(() => ID)
	public id!: string

	@Field(() => String)
	followerId!: string

	@Field(() => UserModel)
	follower!: UserModel

	@Field(() => String)
	followingId!: string

	@Field(() => UserModel)
	following!: UserModel

	@Field(() => Date)
	public createdAt!: Date

	@Field(() => Date)
	public updatedAt!: Date
}
