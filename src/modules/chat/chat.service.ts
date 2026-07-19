import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common'
import { type User } from '@prisma/client'

import { PrismaService } from '@/src/core/prisma/prisma.service'
import { ChangeChatSettingsInput } from '@/src/modules/chat/inputs/change-chat-settings.input'
import { SendMessageInput } from '@/src/modules/chat/inputs/chat-message.input'

@Injectable()
export class ChatService {
	constructor(private readonly prismaService: PrismaService) {}

	public async findMessagesByStream(streamId: string) {
		const messages = await this.prismaService.chatMessage.findMany({
			where: {
				streamId,
			},
			orderBy: {
				createdAt: 'desc',
			},
			include: {
				user: true,
			},
		})

		return messages
	}

	public async sendMessage(user: User, input: SendMessageInput) {
		const { text, streamId } = input

		const stream = await this.prismaService.stream.findUnique({
			where: {
				id: streamId,
			},
		})

		if (!stream) {
			throw new NotFoundException('Стрим не найден')
		}

		if (!stream.isLive) {
			throw new BadRequestException('Стрим оффлайн')
		}

		const message = await this.prismaService.chatMessage.create({
			data: {
				text,
				user: {
					connect: {
						id: user.id,
					},
				},
				stream: {
					connect: {
						id: streamId,
					},
				},
			},
			include: {
				stream: true,
			},
		})

		return message
	}

	public async changeChatSettings(
		user: User,
		input: ChangeChatSettingsInput,
	) {
		const {
			isChatEnabled,
			isChatFollowersOnly,
			isChatPremiumFollowersOnly,
		} = input

		await this.prismaService.stream.update({
			where: {
				userId: user.id,
			},
			data: {
				isChatEnabled,
				isChatFollowersOnly,
				isChatPremiumFollowersOnly,
			},
		})

		return true
	}
}
