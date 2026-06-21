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

interface AccountDeleteTemplateProps {
    email?: string;
    deletedAt?: Date | string;
}

export function AccountDeleteTemplate({
    email,
    deletedAt
}: AccountDeleteTemplateProps) {
    const deletedAtText = deletedAt
        ? new Date(deletedAt).toLocaleString('ru-RU', {
              dateStyle: 'long',
              timeStyle: 'short'
          })
        : null;

    return (
        <Html>
            <Head />
            <Preview>Аккаунт был полностью удален из системы</Preview>

            <Tailwind>
                <Body className="bg-slate-100 text-slate-900">
                    <Container className="mx-auto px-4 py-8">
                        <Section className="mx-auto max-w-[560px] rounded-2xl bg-white p-8 shadow-[0_10px_30px_-10px_rgba(15,23,42,0.25)]">
                            <Section className="mb-6 rounded-xl bg-slate-200 px-4 py-3">
                                <Text className="m-0 text-sm font-semibold uppercase tracking-wider text-slate-700">
                                    Удаление аккаунта
                                </Text>
                            </Section>

                            <Text className="m-0 text-2xl font-bold text-slate-950">
                                Аккаунт удален
                            </Text>
                            <Text className="mt-3 text-base leading-7 text-slate-700">
                                Ваш аккаунт был полностью удален из системы. Профиль, данные
                                авторизации и связанные с аккаунтом записи больше недоступны.
                            </Text>

                            <Section className="mt-6 rounded-xl bg-slate-100 px-4 py-4">
                                <Text className="m-0 text-sm font-semibold text-slate-900">
                                    Информация об удалении
                                </Text>

                                {email ? (
                                    <Text className="m-0 mt-2 text-sm text-slate-700">
                                        <span className="font-semibold text-slate-900">Email:</span>{' '}
                                        {email}
                                    </Text>
                                ) : null}

                                {deletedAtText ? (
                                    <Text className="m-0 mt-2 text-sm text-slate-700">
                                        <span className="font-semibold text-slate-900">
                                            Дата удаления:
                                        </span>{' '}
                                        {deletedAtText}
                                    </Text>
                                ) : null}
                            </Section>

                            <Text className="mt-5 text-sm leading-6 text-slate-600">
                                Это действие является окончательным. Если вы считаете, что аккаунт
                                был удален по ошибке, обратитесь в поддержку сервиса.
                            </Text>

                            <Hr className="my-6 border-slate-200" />

                            <Text className="m-0 text-xs text-slate-500">
                                Это автоматическое уведомление. Отвечать на него не нужно.
                            </Text>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
}
