import { Html } from '@react-email/html';
import {
    Body,
    Button,
    Container,
    Head,
    Hr,
    Link,
    Preview,
    Section,
    Tailwind,
    Text
} from '@react-email/components';
import type { SessionMetadata } from '@/src/shared/types/session-metadata.types';

interface PasswordRecoveryTemplateProps {
    domain: string;
    token: string;
    metadata: SessionMetadata;
}

export function PasswordRecoveryTemplate({
    domain,
    token,
    metadata
}: PasswordRecoveryTemplateProps) {
    const resetLink = `${domain}/account/reset-password?token=${token}`;

    const location = [metadata.location?.country, metadata.location?.city]
        .filter(Boolean)
        .join(', ');
    const locationText = location || 'Неизвестно';
    const osText = metadata.device?.os || 'Неизвестно';
    const browserText = metadata.device?.browser || 'Неизвестно';
    const ipText = metadata.ip || 'Неизвестно';

    return (
        <Html>
            <Head />
            <Preview>Ссылка для сброса пароля</Preview>

            <Tailwind>
                <Body className="bg-emerald-50 text-slate-900">
                    <Container className="mx-auto px-4 py-8">
                        <Section className="mx-auto max-w-[560px] rounded-2xl bg-white p-8 shadow-[0_10px_30px_-10px_rgba(16,185,129,0.35)]">
                            <Section className="mb-6 rounded-xl bg-emerald-100 px-4 py-3">
                                <Text className="m-0 text-sm font-semibold uppercase tracking-wider text-emerald-800">
                                    Сброс пароля
                                </Text>
                            </Section>

                            <Text className="m-0 text-2xl font-bold text-emerald-900">
                                Восстановление доступа
                            </Text>
                            <Text className="mt-3 text-base leading-7 text-slate-700">
                                Мы получили запрос на сброс пароля для вашего аккаунта. Нажмите
                                кнопку ниже, чтобы перейти к созданию нового пароля.
                            </Text>

                            <Section className="mt-6">
                                <Button
                                    className="rounded-lg bg-emerald-600 px-6 py-3 text-base font-semibold text-white"
                                    href={resetLink}
                                >
                                    Сбросить пароль
                                </Button>
                            </Section>

                            <Text className="mt-5 text-sm text-slate-600">
                                Если кнопка не работает, откройте ссылку вручную:
                            </Text>
                            <Link className="text-sm text-emerald-700 underline" href={resetLink}>
                                {resetLink}
                            </Link>

                            <Section className="mt-6 rounded-xl bg-emerald-50 px-4 py-4">
                                <Text className="m-0 text-sm font-semibold text-emerald-900">
                                    Данные запроса
                                </Text>
                                <Text className="m-0 mt-2 text-sm text-slate-700">
                                    <span className="font-semibold text-slate-900">Расположение:</span>{' '}
                                    {locationText}
                                </Text>
                                <Text className="m-0 mt-2 text-sm text-slate-700">
                                    <span className="font-semibold text-slate-900">ОС:</span> {osText}
                                </Text>
                                <Text className="m-0 mt-2 text-sm text-slate-700">
                                    <span className="font-semibold text-slate-900">Браузер:</span>{' '}
                                    {browserText}
                                </Text>
                                <Text className="m-0 mt-2 text-sm text-slate-700">
                                    <span className="font-semibold text-slate-900">IP:</span> {ipText}
                                </Text>
                            </Section>

                            <Hr className="my-6 border-emerald-100" />

                            <Text className="m-0 text-xs text-slate-500">
                                Если вы не запрашивали сброс пароля, просто проигнорируйте это
                                письмо.
                            </Text>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
}
