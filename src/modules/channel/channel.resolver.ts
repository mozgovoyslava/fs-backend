import { Args, Query, Resolver } from '@nestjs/graphql'

import { UserModel } from '@/src/modules/auth/account/models/user.model'

import { ChannelService } from './channel.service'

@Resolver('Channel')
export class ChannelResolver {
	constructor(private readonly channelService: ChannelService) {}

	@Query(() => [UserModel], { name: 'findRecomendedChannels' })
	public async findRecomendedChannels() {
		return this.channelService.findRecomendedChannels()
	}

	@Query(() => UserModel, { name: 'findChanelByUsername' })
	public async findChanelByUsername(@Args('username') username: string) {
		return this.channelService.findByUsername(username)
	}

	@Query(() => Number, { name: 'findChannelFollowersCount' })
	public async findChannelFollowersCount(
		@Args('channelId') channelId: string,
	) {
		return this.channelService.findFollowersCountByChannel(channelId)
	}
}
