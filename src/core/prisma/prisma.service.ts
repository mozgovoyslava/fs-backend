import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'

@Injectable()
export class PrismaService
	extends PrismaClient
	implements OnModuleInit, OnModuleDestroy
{
	constructor() {
		const connectionString = process.env.POSTGRES_URL

		if (!connectionString) {
			throw new Error('POSTGRES_URI must be set for Prisma Client')
		}

		const pool = new Pool({ connectionString })
		const adapter = new PrismaPg(pool)

		super({ adapter })
	}

	public async onModuleInit() {
		await this.$connect()
	}

	public async onModuleDestroy() {
		await this.$disconnect()
	}
}
