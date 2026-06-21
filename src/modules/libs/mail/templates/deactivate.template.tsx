import { Html } from '@react-email/html';
import {
    Body,
    Container,
    Head,
    Hr,
    Preview,
    Section,
    Tailwind,
    Text
} from '@react-email/components';
import type { SessionMetadata } from '@/src/shared/types/session-metadata.types';

interface DeactivateTemplateProps {
    code: string;
    metadata: SessionMetadata;
}

export function DeactivateTemplate({
    code,
    metadata
}: DeactivateTemplateProps) {
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
            <Preview>Подтверждение деактивации аккаунта</Preview>

            <Tailwind>
                <Body className="bg-rose-50 text-slate-900">
                    <Container className="mx-auto px-4 py-8">
                        <Section className="mx-auto max-w-[560px] rounded-2xl bg-white p-8 shadow-[0_10px_30px_-10px_rgba(244,63,94,0.35)]">
                            <Section className="mb-6 rounded-xl bg-rose-100 px-4 py-3">
                                <Text className="m-0 text-sm font-semibold uppercase tracking-wider text-rose-800">
                                    Деактивация аккаунта
                                </Text>
                            </Section>

                            <Text className="m-0 text-2xl font-bold text-rose-900">
                                Подтвердите действие
                            </Text>
                            <Text className="mt-3 text-base leading-7 text-slate-700">
                                Мы получили запрос на деактивацию вашего аккаунта. Используйте код
                                ниже, если вы действительно хотите продолжить.
                            </Text>

                            <Section className="mt-6 rounded-xl bg-rose-50 px-4 py-5 text-center">
                                <Text className="m-0 text-sm font-semibold uppercase tracking-wider text-rose-800">
                                    Код подтверждения
                                </Text>
                                <Text className="m-0 mt-3 text-4xl font-bold tracking-[0.2em] text-rose-900">
                                    {code}
                                </Text>
                            </Section>

                            <Text className="mt-5 text-sm text-slate-600">
                                Введите этот код на сайте, чтобы подтвердить деактивацию аккаунта.
                            </Text>

                            <Section className="mt-6 rounded-xl bg-rose-50 px-4 py-4">
                                <Text className="m-0 text-sm font-semibold text-rose-900">
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

                            <Hr className="my-6 border-rose-100" />

                            <Text className="m-0 text-xs text-slate-500">
                                Если вы не запрашивали деактивацию аккаунта, просто
                                проигнорируйте это письмо.
                            </Text>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
}
