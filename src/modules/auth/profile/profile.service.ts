import {
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common'
import { User } from '@prisma/client'
import type { FileUpload } from 'graphql-upload/processRequest.mjs'
import sharp from 'sharp'

import { PrismaService } from '@/src/core/prisma/prisma.service'
import { ChangeProfileInfoInput } from '@/src/modules/auth/profile/inputs/change-profile-info.input'
import {
	SocialLinkInput,
	SocialLinkOrderInput,
} from '@/src/modules/auth/profile/inputs/social-link.input'
import { S3Service } from '@/src/modules/libs/s3/s3.service'

@Injectable()
export class ProfileService {
	public constructor(
		private readonly prismaService: PrismaService,
		private readonly storageService: S3Service,
	) {}

	public async changeAvatar(user: User, file: FileUpload) {
		if (user.avatar) {
			await this.storageService.remove(user.avatar)
		}

		const chunks: Buffer[] = []

		for await (const chunk of file.createReadStream()) {
			chunks.push(chunk)
		}

		const buffer = Buffer.concat(chunks)

		const fileName = `/channels/${user.username}.webp`

		const isGif = file.filename?.toLowerCase().endsWith('.gif')

		const processedBuffer = await sharp(
			buffer,
			isGif ? { animated: true } : undefined,
		)
			.resize(512, 512)
			.webp()
			.toBuffer()

		await this.storageService.upload(
			processedBuffer,
			fileName,
			'image/webp',
		)

		await this.prismaService.user.update({
			where: {
				id: user.id,
			},
			data: {
				avatar: fileName,
			},
		})

		return true
	}

	public async removeAvatar(user: User) {
		if (!user.avatar) {
			return
		}

		await this.storageService.remove(user.avatar)

		await this.prismaService.user.update({
			where: {
				id: user.id,
			},
			data: {
				avatar: null,
			},
		})

		return true
	}

	public async changeInfo(user: User, input: ChangeProfileInfoInput) {
		const { username, displayName, bio } = input

		const userNameExists = await this.prismaService.user.findUnique({
			where: {
				username: username,
			},
		})

		if (userNameExists && username !== user.username) {
			throw new ConflictException('Имя пользователя занято')
		}

		await this.prismaService.user.update({
			where: {
				id: user.id,
			},

			data: {
				username,
				displayName,
				bio,
			},
		})

		return true
	}

	public async findSocialLinks(user: User) {
		const socialLinks = await this.prismaService.socialLink.findMany({
			where: {
				userId: user.id,
			},
			orderBy: {
				position: 'asc',
			},
		})

		return socialLinks
	}

	public async createSocialLink(user: User, input: SocialLinkInput) {
		const { title, url } = input

		const lastSocialLink = await this.prismaService.socialLink.findFirst({
			where: {
				userId: user.id,
			},
			orderBy: {
				position: 'desc',
			},
		})

		const newPosition = lastSocialLink ? lastSocialLink.position + 1 : 1

		await this.prismaService.socialLink.create({
			data: {
				title,
				url,
				position: newPosition,
				user: {
					connect: {
						id: user.id,
					},
				},
			},
		})

		return true
	}

	public async reorderSocialLinks(user: User, list: SocialLinkOrderInput[]) {
		if (!list.length) return true

		const socialLinkIds = [
			...new Set(list.map(socialLink => socialLink.id)),
		]

		await this.prismaService.$transaction(async prisma => {
			const ownedSocialLinksCount = await prisma.socialLink.count({
				where: {
					id: {
						in: socialLinkIds,
					},
					userId: user.id,
				},
			})

			if (ownedSocialLinksCount !== socialLinkIds.length) {
				throw new NotFoundException('Социальная ссылка не найдена')
			}

			for (const socialLink of list) {
				await prisma.socialLink.update({
					where: {
						id: socialLink.id,
					},
					data: {
						position: socialLink.position,
					},
				})
			}
		})

		return true
	}

	public async updateSocialLink(
		user: User,
		id: string,
		input: SocialLinkInput,
	) {
		const { title, url } = input

		const { count } = await this.prismaService.socialLink.updateMany({
			where: {
				id: id,
				userId: user.id,
			},
			data: {
				title,
				url,
			},
		})

		if (!count) {
			throw new NotFoundException('Социальная ссылка не найдена')
		}

		return true
	}

	public async deleteSocialLink(user: User, id: string) {
		const { count } = await this.prismaService.socialLink.deleteMany({
			where: {
				id: id,
				userId: user.id,
			},
		})

		if (!count) {
			throw new NotFoundException('Социальная ссылка не найдена')
		}

		return true
	}
}
