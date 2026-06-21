import { AccountDeleteTemplate } from '@/src/modules/libs/mail/templates/account-delete.template';
import { DeactivateTemplate } from '@/src/modules/libs/mail/templates/deactivate.template';
import { PasswordRecoveryTemplate } from '@/src/modules/libs/mail/templates/password-recovery.template';
import { VerificationTemplate } from '@/src/modules/libs/mail/templates/verification.template';
import { type SessionMetadata } from '@/src/shared/types/session-metadata.types';
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { render } from '@react-email/render';

@Injectable()
export class MailService {

    public constructor(
        private readonly mailerService: MailerService,
        private readonly configService: ConfigService,
    ) {}


    public async sendVerificationToken(email: string, token: string) {
        const domain = this.configService.getOrThrow<string>('ALLOWED_ORIGIN');

        const html = await render(VerificationTemplate({domain, token}));

        return this.sendMail(
            email, 
            'Верbфикация email',
            html
        )
    }

    public async sendResetPasswordToken(email: string, token: string, metadata: SessionMetadata) {
        const domain = this.configService.getOrThrow<string>('ALLOWED_ORIGIN');

        const html = await render(PasswordRecoveryTemplate({domain, token, metadata}));

        return this.sendMail(
            email, 
            'Сброс пароля',
            html
        )
    }

    public async sendDeactivateToken(email: string, code: string, metadata: SessionMetadata) {
        const html = await render(DeactivateTemplate({ code, metadata}));

        return this.sendMail(
            email, 
            'Деактивация аккаунта',
            html
        )
    }

    public async sendAccountDeletion(email: string, deletedAt: Date) {
        const html = await render(AccountDeleteTemplate({ email, deletedAt }));

        return this.sendMail(
            email, 
            'Аккаунт удален',
            html
        )
    }


    private sendMail(email: string, subject: string, html: string) {
        return this.mailerService.sendMail({
            to: email,
            subject: email,
            html,
        })
    }
}
