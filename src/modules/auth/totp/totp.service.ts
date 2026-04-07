import { PrismaService } from '@/src/core/prisma/prisma.service';
import { EnableTotpInput } from '@/src/modules/auth/totp/inputs/enable-totp.input';
import { BadRequestException, Injectable } from '@nestjs/common';
import { type User } from '@prisma/client';
import { randomBytes } from 'crypto';
import { encode } from 'hi-base32';
import { TOTP } from 'otpauth';

import qrcode from 'qrcode';

@Injectable()
export class TotpService {

    public constructor(
        private readonly prismaService: PrismaService,
    ) {}


    public async generate(user: User) {
        const secret = encode(randomBytes(15)).replace(/=/g, '').substring(0, 24);

        const totp = new TOTP({
            issuer: 'FS_BACKEND',
            label: `${user.email}`,
            algorithm: 'SHA1',
            digits: 6,
            secret
        })

        const otpAuthUrl = totp.toString();

        const qrcodeUrl = await qrcode.toDataURL(otpAuthUrl);


        return {
            qrcodeUrl,
            secret
        }
    }


    public async enable(user: User, input: EnableTotpInput) {
        const {pin, secret} = input;

        const totp = new TOTP({
            issuer: 'FS_BACKEND',
            label: `${user.email}`,
            algorithm: 'SHA1',
            digits: 6,
            secret
        })

        const delta = totp.validate({
            token: pin
        })

        if (delta === null) {
            throw new BadRequestException('Неверный код')
        }

        await this.prismaService.user.update({
            where: {
                id: user.id
            },
            data: {
                isTotpEnabled: true,
                totpSecret: secret
            }
        });

        return true;
    }

    public async disable(user: User) {
        await this.prismaService.user.update({
            where: {
                id: user.id
            },
            data: {
                isTotpEnabled: false,
                totpSecret: null
            }
        });

        return true;
    }
}
