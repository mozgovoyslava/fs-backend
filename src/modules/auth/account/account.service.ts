import {
	ConflictException,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common'
import { type User } from '@prisma/client'
import { hash, verify } from 'argon2'

import { PrismaService } from '@/src/core/prisma/prisma.service'
import { ChangeEmailInput } from '@/src/modules/auth/account/inputs/change-email.input'
import { ChangePasswordInput } from '@/src/modules/auth/account/inputs/change-password.input'
import { CreateUserInput } from '@/src/modules/auth/account/inputs/create-user.input'
import { VerificationService } from '@/src/modules/auth/verification/verification.service'

@Injectable()
export class AccountService {
	public constructor(
		private readonly prismaService: PrismaService,
		private readonly verificationService: VerificationService,
	) {}

	public async me(id: string) {
		const user = this.prismaService.user.findUnique({
			where: {
				id,
			},
		})

		return user
	}

	public async findAll() {
		const users = await this.prismaService.user.findMany()

		return users
	}

	public async create(input: CreateUserInput) {
		const { email, password, username } = input

		const isUserNameExists = await this.prismaService.user.findUnique({
			where: { username },
		})

		if (isUserNameExists) {
			throw new ConflictException(
				'Пользователь с таким именем уже существует',
			)
		}

		const isEmailExists = await this.prismaService.user.findUnique({
			where: { email },
		})

		if (isEmailExists) {
			throw new ConflictException(
				'Пользователь с таким email уже существует',
			)
		}

		const user = await this.prismaService.user.create({
			data: {
				username,
				email,
				password: await hash(password),
				displayName: username,
				stream: {
					create: {
						title: `Стрим ${username}`,
					},
				},
			},
		})

		await this.verificationService.sendVerificationToken(user)

		return true
	}

	public async changeEmail(user: User, input: ChangeEmailInput) {
		const { email } = input

		await this.prismaService.user.update({
			where: {
				id: user.id,
			},
			data: { email },
		})

		return true
	}

	public async changePassword(user: User, input: ChangePasswordInput) {
		const { oldPassword, newPassword } = input

		const isValidPassword = await verify(user.password, oldPassword)

		if (!isValidPassword) {
			throw new UnauthorizedException('неверный старый пароль')
		}

		await this.prismaService.user.update({
			where: {
				id: user.id,
			},
			data: {
				password: await hash(newPassword),
			},
		})

		return true
	}
}
