import { Injectable, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Prisma, User } from '@prisma/client'
import type { FileUpload } from 'graphql-upload/processRequest.mjs'
import { AccessToken } from 'livekit-server-sdk'
import sharp from 'sharp'

import { PrismaService } from '@/src/core/prisma/prisma.service'
import { S3Service } from '@/src/modules/libs/s3/s3.service'
import { ChangeStreamInput } from '@/src/modules/stream/inputs/change-stream.input'
import { GenerateStreamTokenInput } from '@/src/modules/stream/inputs/generate-stream-token.input'
import { StreamFiltersInput } from '@/src/modules/stream/inputs/stream-filters.input'

@Injectable()
export class StreamService {
	public constructor(
		private readonly prismaService: PrismaService,
		private readonly configService: ConfigService,
		private readonly storageService: S3Service,
	) {}

	public async findAll(input: StreamFiltersInput = {}) {
		const { take, skip, searchTerm } = input

		const whereClause = searchTerm
			? this.findBySearchTermFilters(searchTerm)
			: undefined

		const streams = await this.prismaService.stream.findMany({
			take: take ?? 12,
			skip: skip ?? 0,
			where: {
				user: {
					isDeactivated: false,
				},
				...whereClause,
			},
			include: {
				user: true,
				category: true,
			},
			orderBy: {
				createdAt: 'desc',
			},
		})

		return streams
	}

	public async findRandom(take: number = 4) {
		const normalizedTake = Math.max(0, Math.floor(take))

		if (!normalizedTake) {
			return []
		}

		const where: Prisma.StreamWhereInput = {
			user: {
				isDeactivated: false,
			},
		}

		const total = await this.prismaService.stream.count({ where })
		const limit = Math.min(normalizedTake, total)

		if (!limit) {
			return []
		}

		const randomSkips = new Set<number>()

		while (randomSkips.size < limit) {
			randomSkips.add(Math.floor(Math.random() * total))
		}

		const streams = await Promise.all(
			Array.from(randomSkips).map(skip => {
				return this.prismaService.stream.findFirst({
					skip,
					take: 1,
					where,
					include: {
						user: true,
						category: true,
					},
					orderBy: {
						id: 'asc',
					},
				})
			}),
		)

		return streams.filter(stream => stream !== null)
	}

	public async changeInfo(user: User, input: ChangeStreamInput) {
		const { title, categoryId } = input

		await this.prismaService.stream.update({
			where: {
				userId: user.id,
			},
			data: {
				title,
				category: {
					connect: {
						id: categoryId,
					},
				},
			},
		})

		return true
	}

	public async changeThumbnail(user: User, file: FileUpload) {
		const stream = await this.findByUserId(user)

		if (stream?.thumbnailUrl) {
			await this.storageService.remove(stream.thumbnailUrl)
		}

		const chunks: Buffer[] = []

		for await (const chunk of file.createReadStream()) {
			chunks.push(chunk)
		}

		const buffer = Buffer.concat(chunks)

		const fileName = `/streams/${user.username}.webp`

		const isGif = file.filename?.toLowerCase().endsWith('.gif')

		const processedBuffer = await sharp(
			buffer,
			isGif ? { animated: true } : undefined,
		)
			.resize(1280, 720)
			.webp()
			.toBuffer()

		await this.storageService.upload(
			processedBuffer,
			fileName,
			'image/webp',
		)

		await this.prismaService.stream.update({
			where: {
				id: stream?.id,
			},
			data: {
				thumbnailUrl: fileName,
			},
		})

		return true
	}

	public async removeThumbnail(user: User) {
		const stream = await this.findByUserId(user)

		if (!stream?.thumbnailUrl) {
			return
		}

		await this.storageService.remove(stream.thumbnailUrl)

		await this.prismaService.stream.update({
			where: {
				id: stream.id,
			},
			data: {
				thumbnailUrl: null,
			},
		})

		return true
	}

	public async generateStreamToken(input: GenerateStreamTokenInput) {
		const { userId, channelId } = input

		let self: { id: string; username: string }

		const user = await this.prismaService.user.findUnique({
			where: {
				id: userId,
			},
		})

		if (user) {
			self = { id: user.id, username: user.username }
		} else {
			self = {
				id: userId,
				username: `Зритель ${Math.floor(Math.random() * 100000)}`,
			}
		}

		const channel = await this.prismaService.user.findUnique({
			where: {
				id: channelId,
			},
		})

		if (!channel) {
			throw new NotFoundException('Канал не найдет')
		}

		const isHost = self.id === channel.id

		const token = new AccessToken(
			this.configService.getOrThrow<string>('LIVEKIT_API_KEY'),
			this.configService.getOrThrow<string>('LIVEKIT_API_SECRET'),
			{
				identity: isHost ? `Host-${self.id}` : self.id.toString(),
				name: self.username,
			},
		)

		token.addGrant({
			room: channel.id,
			roomJoin: true,
			canPublish: false,
		})

		return { token: token.toJwt() }
	}

	private async findByUserId(user: User) {
		const stream = await this.prismaService.stream.findUnique({
			where: {
				userId: user.id,
			},
		})

		return stream
	}

	private findBySearchTermFilters(
		searchTerm?: string,
	): Prisma.StreamWhereInput {
		const trimmedSearchTerm = searchTerm?.trim()

		if (!trimmedSearchTerm) {
			return {}
		}

		return {
			OR: [
				{
					title: {
						contains: trimmedSearchTerm,
						mode: 'insensitive',
					},
				},
				{
					user: {
						is: {
							username: {
								contains: trimmedSearchTerm,
								mode: 'insensitive',
							},
						},
					},
				},
			],
		}
	}
}
