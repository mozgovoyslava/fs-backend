import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class GenerateStreamTokenModel {
	@Field(() => String)
	public serverUrl!: string

	@Field(() => String)
	public token!: string
}
