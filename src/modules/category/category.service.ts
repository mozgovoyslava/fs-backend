import { Injectable, NotFoundException } from '@nestjs/common'

import { PrismaService } from '@/src/core/prisma/prisma.service'

@Injectable()
export class CategoryService {
	constructor(private readonly prismaService: PrismaService) {}

	public async findAll() {
		const categories = await this.prismaService.category.findMany({
			orderBy: {
				createdAt: 'desc',
			},
			include: {
				streams: {
					include: {
						category: true,
						user: true,
					},
				},
			},
		})

		return categories
	}

	public async findRandom(take: number = 4) {
		const normalizedTake = Math.max(0, Math.floor(take))

		if (!normalizedTake) {
			return []
		}

		const total = await this.prismaService.category.count()
		const limit = Math.min(normalizedTake, total)

		if (!limit) {
			return []
		}

		const randomSkips = new Set<number>()

		while (randomSkips.size < limit) {
			randomSkips.add(Math.floor(Math.random() * total))
		}

		const categories = await Promise.all(
			Array.from(randomSkips).map(skip => {
				return this.prismaService.category.findFirst({
					include: {
						streams: {
							include: {
								category: true,
								user: true,
							},
						},
					},
					skip,
					take: 1,
					orderBy: {
						id: 'asc',
					},
				})
			}),
		)

		return categories.filter(category => category !== null)
	}

	public async findBySlug(slug: string) {
		const category = await this.prismaService.category.findUnique({
			where: {
				slug,
			},
			include: {
				streams: {
					include: {
						user: true,
						category: true,
					},
				},
			},
		})

		if (!category) {
			throw new NotFoundException('Категория не найдена')
		}

		return category
	}
}
