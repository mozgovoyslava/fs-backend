import { Logger } from '@nestjs/common'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import { hash } from 'argon2'
import dotenv from 'dotenv'
import { expand } from 'dotenv-expand'
import { Pool } from 'pg'

import { categoriesData } from './data/categories.data'
import { streamTitles } from './data/streams.data'
import { seedUsernames } from './data/users.data'

expand(dotenv.config())

const connectionString = process.env.POSTGRES_URL

if (!connectionString) {
	throw new Error('POSTGRES_URL must be set for database seeding')
}

const pool = new Pool({ connectionString })
const prisma = new PrismaClient({
	adapter: new PrismaPg(pool),
})

function getSeedCategorySlug(userIndex: number) {
	return categoriesData[userIndex % categoriesData.length].slug
}

function getSeedStreamTitle(categorySlug: string, userIndex: number) {
	const titles = streamTitles[categorySlug] ?? streamTitles.gaming
	const titleIndex = Math.floor(userIndex / categoriesData.length) % titles.length

	return titles[titleIndex]
}

function toDisplayName(username: string) {
	return username
		.split(/[.-]/)
		.map(part => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
		.join(' ')
}

function toSocialHandle(username: string) {
	return username.replace(/[^a-zA-Z0-9_]/g, '')
}

async function clearDatabase() {
	await prisma.$transaction([
		prisma.token.deleteMany(),
		prisma.notification.deleteMany(),
		prisma.notificationSettings.deleteMany(),
		prisma.chatMessage.deleteMany(),
		prisma.socialLink.deleteMany(),
		prisma.follow.deleteMany(),
		prisma.sponsorshipSubscription.deleteMany(),
		prisma.transaction.deleteMany(),
		prisma.sponsorshipPlan.deleteMany(),
		prisma.stream.deleteMany(),
		prisma.user.deleteMany(),
		prisma.category.deleteMany(),
	])
}

async function main() {
	try {
		Logger.log('Starting database seed')

		if (seedUsernames.length !== 100) {
			throw new Error(`Expected 100 seed users, received ${seedUsernames.length}`)
		}

		await clearDatabase()

		await prisma.category.createMany({
			data: categoriesData,
		})

		const categories = await prisma.category.findMany({
			where: {
				slug: {
					in: categoriesData.map(category => category.slug),
				},
			},
		})
		const categoryBySlug = new Map(
			categories.map(category => [category.slug, category]),
		)
		const password = await hash('12345678')

		await prisma.$transaction(async tx => {
			for (const [userIndex, username] of seedUsernames.entries()) {
				const categorySlug = getSeedCategorySlug(userIndex)
				const category = categoryBySlug.get(categorySlug)

				if (!category) {
					throw new Error(`Seed category ${categorySlug} was not created`)
				}

				const socialHandle = toSocialHandle(username)

				const createdUser = await tx.user.create({
					data: {
						email: `${username}@gmail.com`,
						password,
						username,
						displayName: toDisplayName(username),
						avatar: `/channels/${username}.webp`,
						bio: 'Моковый пользователь для локальной разработки и демо-данных',
						isEmailVerified: true,
						socialLinks: {
							createMany: {
								data: [
									{
										title: 'Telegram',
										url: `https://t.me/${socialHandle}`,
										position: 1,
									},
									{
										title: 'YouTube',
										url: `https://youtube.com/@${socialHandle}`,
										position: 2,
									},
								],
							},
						},
						stream: {
							create: {
								title: getSeedStreamTitle(categorySlug, userIndex),
								thumbnailUrl: `/streams/${username}.webp`,
								isLive: false,
								category: {
									connect: {
										id: category.id,
									},
								},
							},
						},
					},
				})

				Logger.log(`Created user ${createdUser.username} with stream`)
			}
		})

		Logger.log('Database seed completed')
	} catch (error) {
		Logger.error(error)
		throw error
	} finally {
		Logger.log('Closing database connection...')
		await prisma.$disconnect()
		await pool.end()
		Logger.log('Database connection closed')
	}
}

main()
