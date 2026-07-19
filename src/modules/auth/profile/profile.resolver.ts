import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { type User } from '@prisma/client'
import GraphQLUpload from 'graphql-upload/GraphQLUpload.mjs'
import type { FileUpload } from 'graphql-upload/processRequest.mjs'

import { ChangeProfileInfoInput } from '@/src/modules/auth/profile/inputs/change-profile-info.input'
import {
	SocialLinkInput,
	SocialLinkOrderInput,
} from '@/src/modules/auth/profile/inputs/social-link.input'
import { SocialLinkModel } from '@/src/modules/auth/profile/models/social-link.model'
import { Authorization } from '@/src/shared/decorators/auth.decorator'
import { Authorized } from '@/src/shared/decorators/authorized.decorator'
import { FileValidationPipe } from '@/src/shared/pipes/file-validation.pipe'

import { ProfileService } from './profile.service'

@Resolver('Profile')
export class ProfileResolver {
	constructor(private readonly profileService: ProfileService) {}

	@Authorization()
	@Mutation(() => Boolean, { name: 'changeProfileAvatar' })
	public async changeAvatar(
		@Authorized() user: User,
		@Args('avatar', { type: () => GraphQLUpload }, FileValidationPipe)
		avatar: FileUpload,
	) {
		return this.profileService.changeAvatar(user, avatar)
	}

	@Authorization()
	@Mutation(() => Boolean, { name: 'removeProfileAvatar' })
	public async removeAvatar(@Authorized() user: User) {
		return this.profileService.removeAvatar(user)
	}

	@Authorization()
	@Mutation(() => Boolean, { name: 'changeProfileInfo' })
	public async changeInfo(
		@Authorized() user: User,
		@Args('data') input: ChangeProfileInfoInput,
	) {
		return this.profileService.changeInfo(user, input)
	}

	@Authorization()
	@Query(() => [SocialLinkModel], { name: 'findSocialLinks' })
	public async findSocialLinks(@Authorized() user: User) {
		return this.profileService.findSocialLinks(user)
	}

	@Authorization()
	@Mutation(() => Boolean, { name: 'createSocialLink' })
	public async createSocialLink(
		@Authorized() user: User,
		@Args('data') input: SocialLinkInput,
	) {
		return this.profileService.createSocialLink(user, input)
	}

	@Authorization()
	@Mutation(() => Boolean, { name: 'reorderSocialLinks' })
	public async reorderSocialLinks(
		@Authorized() user: User,
		@Args('list', { type: () => [SocialLinkOrderInput] })
		list: SocialLinkOrderInput[],
	) {
		return this.profileService.reorderSocialLinks(user, list)
	}

	@Authorization()
	@Mutation(() => Boolean, { name: 'updateSocialLink' })
	public async updateSocialLink(
		@Authorized() user: User,
		@Args('id') id: string,
		@Args('data') input: SocialLinkInput,
	) {
		return this.profileService.updateSocialLink(user, id, input)
	}

	@Authorization()
	@Mutation(() => Boolean, { name: 'deleteSocialLink' })
	public async deleteSocialLink(
		@Authorized() user: User,
		@Args('id') id: string,
	) {
		return this.profileService.deleteSocialLink(user, id)
	}
}
