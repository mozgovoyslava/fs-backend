import { Field, InputType } from '@nestjs/graphql'
import { IsNumber, IsOptional, IsString } from 'class-validator'

@InputType()
export class StreamFiltersInput {
	@Field(() => Number, { nullable: true })
	@IsNumber()
	@IsOptional()
	public take?: number

	@IsNumber()
	@IsOptional()
	@Field(() => Number, { nullable: true })
	public skip?: number

	@Field(() => String, { nullable: true })
	@IsString()
	@IsOptional()
	public searchTerm?: string
}
