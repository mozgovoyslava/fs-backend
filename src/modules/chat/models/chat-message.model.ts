import { Field, ID, ObjectType } from '@nestjs/graphql'
import { type ChatMessage } from '@prisma/client'

import { UserModel } from '@/src/modules/auth/account/models/user.model'
import { StreamModel } from '@/src/modules/stream/models/stream.model'

@ObjectType()
export class ChatMessageModel implements ChatMessage {
	@Field(() => ID)
	public id!: string

	@Field(() => String)
	text!: string

	@Field(() => String)
	streamId!: string

	@Field(() => StreamModel)
	stream!: StreamModel

	@Field(() => String)
	userId!: string

	@Field(() => UserModel)
	user!: UserModel

	@Field(() => Date)
	public createdAt!: Date

	@Field(() => Date)
	public updatedAt!: Date
}
