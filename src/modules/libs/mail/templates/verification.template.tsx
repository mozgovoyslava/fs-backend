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

interface VerificationTemplateProps {
    domain: string;
    token: string;
}


export function VerificationTemplate ({
    domain,
    token
} : VerificationTemplateProps) {

    const verificationLink = `${domain}/account/verify?token=${token}`;

    return (
        <Html>
            <Head />
            <Preview>Подтвердите email, чтобы активировать аккаунт</Preview>

            <Tailwind>
                <Body className="bg-emerald-50 text-slate-900">
                    <Container className="mx-auto px-4 py-8">
                        <Section className="mx-auto max-w-[560px] rounded-2xl bg-white p-8 shadow-[0_10px_30px_-10px_rgba(16,185,129,0.35)]">
                            <Section className="mb-6 rounded-xl bg-emerald-100 px-4 py-3">
                                <Text className="m-0 text-sm font-semibold uppercase tracking-wider text-emerald-800">
                                    Верификация аккаунта
                                </Text>
                            </Section>

                            <Text className="m-0 text-2xl font-bold text-emerald-900">
                                Подтвердите ваш email
                            </Text>
                            <Text className="mt-3 text-base leading-7 text-slate-700">
                                Мы почти закончили. Нажмите кнопку ниже, чтобы подтвердить адрес
                                электронной почты и активировать аккаунт.
                            </Text>

                            <Section className="mt-6">
                                <Button
                                    className="rounded-lg bg-emerald-600 px-6 py-3 text-base font-semibold text-white"
                                    href={verificationLink}
                                >
                                    Подтвердить email
                                </Button>
                            </Section>

                            <Text className="mt-5 text-sm text-slate-600">
                                Если кнопка не работает, откройте ссылку вручную:
                            </Text>
                            <Link
                                className="text-sm text-emerald-700 underline"
                                href={verificationLink}
                            >
                                {verificationLink}
                            </Link>

                            <Hr className="my-6 border-emerald-100" />

                            <Text className="m-0 text-xs text-slate-500">
                                Если вы не создавали аккаунт, просто проигнорируйте это письмо.
                            </Text>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    )
}
