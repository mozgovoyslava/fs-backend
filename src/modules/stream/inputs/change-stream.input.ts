import { Field, InputType } from '@nestjs/graphql'
import { IsNotEmpty, IsString } from 'class-validator'

@InputType()
export class ChangeStreamInput {
	@Field(() => String)
	@IsString()
	@IsNotEmpty()
	public title!: string

	@Field(() => String, { nullable: true })
	@IsString()
	@IsNotEmpty()
	public categoryId!: string
}
