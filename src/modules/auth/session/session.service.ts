import { PrismaService } from '@/src/core/prisma/prisma.service';
import { RedisService } from '@/src/core/redis/redis.service';
import { LoginInput } from '@/src/modules/auth/session/inputs/login.input';
import { VerificationService } from '@/src/modules/auth/verification/verification.service';
import { getSessionMetadata } from '@/src/shared/utils/session-metadata.util';
import { destroySession, saveSession } from '@/src/shared/utils/session.util';
import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { verify } from 'argon2';
import type { Request } from 'express';
import { TOTP } from 'otpauth';

@Injectable()
export class SessionService {

    public constructor(
        private readonly prismaService: PrismaService,
        private readonly redisService: RedisService,
        private readonly configService: ConfigService,
        private readonly verificationService: VerificationService,
    ) {}


    public async findByUser(req: Request) {
        const userId = req.session.userId;

        if (!userId) {
            throw new NotFoundException('Пользователь не обнаружен в сессии');
        }

        const prefix = this.configService.getOrThrow<string>('SESSION_FOLDER');
        const keys = await this.redisService.client.keys(`${prefix}*`);

        const userSessions: Array<Record<string, unknown>> = [];

        for (const key of keys) {
            const sessionData = await this.redisService.client.get(key);

            if (!sessionData) {
                continue;
            }

            let session: Record<string, unknown>;
            try {
                session = JSON.parse(sessionData) as Record<string, unknown>;
            } catch {
                continue;
            }

            if (session.userId !== userId) {
                continue;
            }

            userSessions.push({
                ...session,
                id: key.substring(prefix.length)
            })
        }

        userSessions.sort((a, b) => {
            const aTime = new Date(String(a.createdAt ?? 0)).getTime();
            const bTime = new Date(String(b.createdAt ?? 0)).getTime();
            return bTime - aTime;
        });

        return userSessions.filter(session => session.id !== req.sessionID);
    }

    public async findCurrent(req: Request) {
        const sessionId = req.sessionID;
        const prefix = this.configService.getOrThrow<string>('SESSION_FOLDER');

        const sessionData = await this.redisService.client.get(
            `${prefix}${sessionId}`
        )

        if (!sessionData) {
            throw new UnauthorizedException('Нет текущей сессии');
        }

        const session = JSON.parse(sessionData);

        return {
            ...session,
            id: sessionId
        }
    }

    public async login(req: Request, input: LoginInput, userAgent: string) {
        const {login, password, pin} = input;

        const user = await this.prismaService.user.findFirst({
            where: {
                OR: [
                    {username: {equals: login}},
                    {email: {equals: login}}
                ]
            }
        })

        if (!user) {
            throw new NotFoundException('Пользователь не найден');
        }

        const isValidPassword = await verify(user.password, password);

        if (!isValidPassword) {
            throw new UnauthorizedException('Неверный пароль');
        }

        if (!user.isEmailVerified) {
            await this.verificationService.sendVerificationToken(user);

            throw new BadRequestException('Верифицируйте аккаунт');
        }

        if (user.isTotpEnabled && user.totpSecret) {
            if (!pin) {
                return {
                    user: null,
                    message: 'Необходим 2FA код для завершения авторизации'
                }
            }

            const totp = new TOTP({
                issuer: 'FS_BACKEND',
                label: `${user.email}`,
                algorithm: 'SHA1',
                digits: 6,
                secret: user.totpSecret,
            })

            const delta = totp.validate({
                token: pin
            })

            if (delta === null) {
                throw new BadRequestException('Неверный код')
            }
        }

        const metadata = getSessionMetadata(req, userAgent);

        const savedUser = await saveSession(req, user, metadata);

        return {
            user: savedUser,
            message: null
        };
    }

    public async logout(req: Request) {
        return destroySession(req, this.configService);
    }


    public async clearSession(req: Request) {
        req.res?.clearCookie(this.configService.getOrThrow<string>('SESSION_NAME'));

        return true;
    }

    public async removeSession(req: Request, sessionId: string) {
        if (req.session.id === sessionId) {
            throw new ConflictException('Нельзя удалить текущую сессию');
        }

        await this.redisService.client.del(
            `${this.configService.getOrThrow<string>('SESSION_FOLDER')}${sessionId}`
        )

        return true;
    }
}

