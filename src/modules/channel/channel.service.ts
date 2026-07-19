import { Injectable, NotFoundException } from '@nestjs/common'

import { PrismaService } from '@/src/core/prisma/prisma.service'

@Injectable()
export class ChannelService {
	constructor(private readonly prismaService: PrismaService) {}

	public async findRecomendedChannels() {
		const channels = await this.prismaService.user.findMany({
			where: {
				isDeactivated: false,
			},
			orderBy: {
				followings: {
					_count: 'desc',
				},
			},
			include: {
				stream: true,
			},
			take: 7,
		})

		return channels
	}

	public async findByUsername(username: string) {
		const channel = await this.prismaService.user.findUnique({
			where: {
				username,
				isDeactivated: false,
			},
			include: {
				socialLinks: {
					orderBy: {
						position: 'asc',
					},
				},
				stream: {
					include: {
						category: true,
					},
				},
				followings: true,
			},
		})

		if (!channel) {
			throw new NotFoundException('Канал не существет или деактивирован')
		}

		return channel
	}

	public async findFollowersCountByChannel(channelId: string) {
		const followersCount = await this.prismaService.follow.count({
			where: {
				following: {
					id: channelId,
				},
			},
		})

		return followersCount
	}
}
