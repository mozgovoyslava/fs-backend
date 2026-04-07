import { PrismaService } from '@/src/core/prisma/prisma.service';
import { ResetPasswordInput } from '@/src/modules/auth/password-recovery/inputs/reset-password.input';
import { MailService } from '@/src/modules/libs/mail/mail.service';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Request } from 'express';
import { generateToken } from '../../../shared/utils/generate-token.util';
import { TokenType } from '@prisma/client';
import { getSessionMetadata } from '@/src/shared/utils/session-metadata.util';
import { NewPasswordInput } from '@/src/modules/auth/password-recovery/inputs/new-password.input';
import { hash } from 'argon2';

@Injectable()
export class PasswordRecoveryService {


    public constructor(
        private readonly prismaService: PrismaService,
        private readonly mailService: MailService,
    ) {}


    public async resetPassword(req: Request, input: ResetPasswordInput, userAgent: string) {
        const { email } = input;
        const user = await this.prismaService.user.findUnique({
            where: {
                email
            }
        })

        if (!user) {
            throw new NotFoundException('Пользователя с таким email нет');
        }

        const resetToken = await generateToken(this.prismaService, user, TokenType.PASSWORD_RESET);

        const metadata = getSessionMetadata(req, userAgent);

        await this.mailService.sendResetPasswordToken(
            email,
            resetToken.token,
            metadata
        )

        return true;
    }


    public async setNewPassword(input: NewPasswordInput) {
        const {password, passwordRepeat, token} = input;

        const existingToken = await this.prismaService.token.findFirst({
            where: {
                token,
                type: TokenType.PASSWORD_RESET
            }
        })

        if (!existingToken) {
            throw new NotFoundException('Токен не найден');
        }

        const hasExpired = new Date(existingToken.expiresIn) < new Date();

        if (hasExpired) {
            throw new BadRequestException('Токен истек');
        }

        
        await this.prismaService.user.update({
            where: {
                id: existingToken.userId
            },
            data: {
                password: await hash(password)
            }
        })

        await this.prismaService.token.delete({
            where: {
                id: existingToken.id
            }
        })

        return true
    }
}
