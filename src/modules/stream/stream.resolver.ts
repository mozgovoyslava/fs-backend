import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { type User } from '@prisma/client'
import GraphQLUpload from 'graphql-upload/GraphQLUpload.mjs'
import type { FileUpload } from 'graphql-upload/processRequest.mjs'

import { ChangeStreamInput } from '@/src/modules/stream/inputs/change-stream.input'
import { GenerateStreamTokenInput } from '@/src/modules/stream/inputs/generate-stream-token.input'
import { StreamFiltersInput } from '@/src/modules/stream/inputs/stream-filters.input'
import { GenerateStreamTokenModel } from '@/src/modules/stream/models/generate-stream-token.model'
import { StreamModel } from '@/src/modules/stream/models/stream.model'
import { Authorization } from '@/src/shared/decorators/auth.decorator'
import { Authorized } from '@/src/shared/decorators/authorized.decorator'
import { FileValidationPipe } from '@/src/shared/pipes/file-validation.pipe'

import { StreamService } from './stream.service'

@Resolver('Stream')
export class StreamResolver {
	constructor(private readonly streamService: StreamService) {}

	@Query(() => [StreamModel], { name: 'findAllStreams' })
	public async findAll(@Args('filters') input: StreamFiltersInput) {
		return this.streamService.findAll(input)
	}

	@Query(() => [StreamModel], { name: 'findRandomStreams' })
	public async findRandom(
		@Args('take', { type: () => Number, nullable: true }) take?: number,
	) {
		return this.streamService.findRandom(take)
	}

	@Query(() => StreamModel, { name: 'findStreamById' })
	public async findById(@Args('id') id: string) {
		return this.streamService.findById(id)
	}

	@Authorization()
	@Mutation(() => Boolean, { name: 'cangeStreamInfo' })
	public async changeInfo(
		@Authorized() user: User,
		@Args('data') input: ChangeStreamInput,
	) {
		return this.streamService.changeInfo(user, input)
	}

	@Authorization()
	@Mutation(() => Boolean, { name: 'changeStreamThumbnail' })
	public async changeStreamThumbnail(
		@Authorized() user: User,
		@Args('thumbnail', { type: () => GraphQLUpload }, FileValidationPipe)
		thumbnail: FileUpload,
	) {
		return this.streamService.changeThumbnail(user, thumbnail)
	}

	@Authorization()
	@Mutation(() => Boolean, { name: 'removeStreamThumbnail' })
	public async removeStreamThumbnail(@Authorized() user: User) {
		return this.streamService.removeThumbnail(user)
	}

	@Mutation(() => GenerateStreamTokenModel, { name: 'generateStreamToken' })
	public async generateStreamToken(
		@Args('data') input: GenerateStreamTokenInput,
	) {
		return this.streamService.generateStreamToken(input)
	}
}
