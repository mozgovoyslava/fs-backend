import { PrismaService } from '@/src/core/prisma/prisma.service';
import { CreateUserInput } from '@/src/modules/auth/account/inputs/create-user.input';
import { VerificationService } from '@/src/modules/auth/verification/verification.service';
import { ConflictException, Injectable } from '@nestjs/common';

import {hash} from 'argon2';

@Injectable()
export class AccountService {

    public constructor(
        private readonly prismaService: PrismaService,
        private readonly verificationService: VerificationService,
    ) {}

    public async me(id: string) {
        const user = this.prismaService.user.findUnique({
            where: {
                id
            }
        })

        return user;
    }

    public async findAll() {
        const users = await this.prismaService.user.findMany();

        return users;
    }


    public async create(input: CreateUserInput) {
        const {email, password, username} = input;

        const isUserNameExists = await this.prismaService.user.findUnique({where: {username}});

        if (isUserNameExists) {
            throw new ConflictException(
                'Пользователь с таким именем уже существует'
            )
        }

        const isEmailExists = await this.prismaService.user.findUnique({where: {email}});

        if (isEmailExists) {
            throw new ConflictException(
                'Пользователь с таким email уже существует'
            )
        }

        const user = await this.prismaService.user.create({
            data: {
                username,
                email,
                password: await hash(password),
                displayName: username
            }
        })

        await this.verificationService.sendVerificationToken(user);

        return true;
    }
}
