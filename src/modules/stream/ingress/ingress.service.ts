import { BadRequestException, Injectable } from '@nestjs/common'
import { type User } from '@prisma/client'
import {
	CreateIngressOptions,
	IngressAudioEncodingPreset,
	IngressInput,
	IngressVideoEncodingPreset,
} from 'livekit-server-sdk'

import { PrismaService } from '@/src/core/prisma/prisma.service'
import { LivekitService } from '@/src/modules/libs/livekit/livekit.service'

@Injectable()
export class IngressService {
	public constructor(
		private readonly prismaService: PrismaService,
		private readonly livekitService: LivekitService,
	) {}

	public async create(user: User, ingressType: IngressInput) {
		await this.resetIngresses(user)

		const options: CreateIngressOptions = {
			name: user.username,
			roomName: user.id,
			participantName: user.username,
			participantIdentity: user.id,
		}

		if (ingressType === IngressInput.WHIP_INPUT) {
			options.bypassTranscoding = true
		} else {
			options.video = {
				source: 1,
				preset: IngressVideoEncodingPreset.H264_1080P_30FPS_3_LAYERS,
			}
			options.audio = {
				source: 2,
				preset: IngressAudioEncodingPreset.OPUS_STEREO_96KBPS,
			}
		}

		const ingress = await this.livekitService.ingress.createIngress(
			ingressType,
			options,
		)

		if (!ingress || !ingress.url || !ingress.streamKey) {
			throw new BadRequestException('Не удалось создать взодной поток')
		}

		await this.prismaService.stream.upsert({
			where: {
				userId: user.id,
			},
			update: {
				ingressId: ingress.ingressId,
				serverUrl: ingress.url,
				streamKey: ingress.streamKey,
			},
			create: {
				title: user.username,
				ingressId: ingress.ingressId,
				serverUrl: ingress.url,
				streamKey: ingress.streamKey,
				user: {
					connect: {
						id: user.id,
					},
				},
			},
		})

		return true
	}

	private async resetIngresses(user: User) {
		const ingresses = await this.livekitService.ingress.listIngress({
			roomName: user.id,
		})

		const rooms = await this.livekitService.room.listRooms([user.id])

		for (const room of rooms) {
			await this.livekitService.room.deleteRoom(room.name)
		}

		for (const ingress of ingresses) {
			if (ingress.ingressId) {
				await this.livekitService.ingress.deleteIngress(
					ingress.ingressId,
				)
			}
		}
	}
}
