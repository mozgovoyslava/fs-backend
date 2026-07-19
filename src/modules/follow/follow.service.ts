import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common'
import { type User } from '@prisma/client'

import { PrismaService } from '@/src/core/prisma/prisma.service'

@Injectable()
export class FollowService {
	constructor(private readonly prismaService: PrismaService) {}

	public async findMyFollowers(user: User) {
		const followers = await this.prismaService.follow.findMany({
			where: {
				followingId: user.id,
			},
			orderBy: {
				createdAt: 'desc',
			},
			include: {
				follower: true,
			},
		})

		return followers
	}

	public async findMyFollowings(user: User) {
		const followings = await this.prismaService.follow.findMany({
			where: {
				followerId: user.id,
			},
			orderBy: {
				createdAt: 'desc',
			},
			include: {
				following: true,
			},
		})

		return followings
	}

	public async follow(user: User, channelId: string) {
		const channel = await this.prismaService.user.findUnique({
			where: {
				id: channelId,
			},
		})

		if (!channel) {
			throw new NotFoundException('Канал не сушествует')
		}

		if (channelId === user.id) {
			throw new ConflictException('Нельзя подписаться на себя')
		}

		const existingFollow = await this.prismaService.follow.findFirst({
			where: {
				followerId: user.id,
				followingId: channelId,
			},
		})

		if (existingFollow) {
			return new ConflictException('Вы уже подписаны')
		}

		await this.prismaService.follow.create({
			data: {
				followerId: user.id,
				followingId: channelId,
			},
		})

		return true
	}

	public async unfollow(user: User, channelId: string) {
		const channel = await this.prismaService.user.findUnique({
			where: {
				id: channelId,
			},
		})

		if (!channel) {
			throw new NotFoundException('Канал не сушествует')
		}

		if (channelId === user.id) {
			throw new ConflictException('Нельзя отписаться на себя')
		}

		const existingFollow = await this.prismaService.follow.findFirst({
			where: {
				followerId: user.id,
				followingId: channelId,
			},
		})

		if (!existingFollow) {
			return new ConflictException('Вы не подписаны')
		}

		await this.prismaService.follow.delete({
			where: {
				id: existingFollow.id,
			},
		})

		return true
	}
}
