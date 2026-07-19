import type { Request } from 'express'
import { lookup } from 'geoip-lite'

import { SessionMetadata } from '@/src/shared/types/session-metadata.types'
import { IS_DEV_ENV } from '@/src/shared/utils/is-dev.util'

import DeviceDetector = require('device-detector-js')

//TODO: Типизация не надеожно выглядит
export function getSessionMetadata(
	request: Request,
	userAgent: string,
): SessionMetadata {
	const ip = IS_DEV_ENV
		? '173.166.164.121'
		: Array.isArray(request.headers['cf-connecting-ip'])
			? request.headers['cf-connecting-ip'][0]
			: request.headers['cf-connecting-ip'] ||
				(typeof request.headers['x-forwarded-for'] === 'string'
					? request.headers['x-forwarded-for'].split(',')[0]
					: request.ip)

	const location = lookup(ip ?? '')

	const device = new DeviceDetector().parse(userAgent)

	return {
		location: {
			country: location?.country ?? 'Неизвестно',
			city: location?.city ?? 'Неизвестно',
			latidute: location?.ll[0] ?? 0,
			longitude: location?.ll[1] ?? 0,
		},
		device: {
			browser: device.client?.name ?? 'Неизвестно',
			os: device.os?.name ?? 'Неизвестно',
			type: device.device?.type ?? 'Неизвестно',
		},
		ip: ip ?? 'Неизвестно',
	}
}
