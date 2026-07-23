type TelegramAccountInfo = {
    email: string
    username: string
    displayName: string
    followers: unknown[]
    followings: unknown[]
}

type TelegramChannelInfo = {
    username: string
    displayName: string
}

type TelegramFollowerInfo = {
    username: string
    displayName: string
}

type TelegramSponsorshipPlanInfo = {
    title: string
    price: number
}

type TelegramUserInfo = {
    username: string
    displayName: string
}

function escapeHtml(value: string | number) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
}

function formatRubles(value: number) {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        maximumFractionDigits: 0
    }).format(value)
}

export const TelegramMessage = {
    chatNotFound() {
        return [
            '<b>Не удалось определить Telegram-чат</b>',
            '',
            'Попробуйте открыть бот заново и повторить команду.'
        ].join('\n')
    },

    connectTelegram() {
        return [
            '<b>Telegram еще не подключен</b>',
            '',
            'Откройте ссылку из настроек уведомлений в личном кабинете.',
            'После подключения бот сможет присылать важные уведомления.'
        ].join('\n')
    },

    invalidToken() {
        return [
            '<b>Ссылка устарела или недействительна</b>',
            '',
            'Вернитесь в настройки уведомлений и создайте новую ссылку для подключения Telegram.'
        ].join('\n')
    },

    connected() {
        return [
            '<b>Telegram успешно подключен</b>',
            '',
            'Теперь сюда будут приходить уведомления, если они включены в настройках аккаунта.'
        ].join('\n')
    },

    welcomeBack() {
        return [
            '<b>Добро пожаловать</b>',
            '',
            'Вы уже авторизованы в Telegram-боте.'
        ].join('\n')
    },

    notConnected() {
        return [
            '<b>Telegram не подключен к аккаунту</b>',
            '',
            'Подключите его через настройки уведомлений в личном кабинете.'
        ].join('\n')
    },

    accountInfo(user: TelegramAccountInfo) {
        return [
            '<b>Ваш аккаунт</b>',
            '',
            `Email: <code>${escapeHtml(user.email)}</code>`,
            `Username: <code>${escapeHtml(user.username)}</code>`,
            `Имя: <b>${escapeHtml(user.displayName)}</b>`,
            '',
            `Подписчики: <b>${escapeHtml(user.followers.length)}</b>`,
            `Подписки: <b>${escapeHtml(user.followings.length)}</b>`
        ].join('\n')
    },

    streamStarted(channel: TelegramChannelInfo, streamTitle?: string | null) {
        return [
            '<b>Начался стрим</b>',
            '',
            `Канал: <b>${escapeHtml(channel.displayName)}</b>`,
            `Username: <code>${escapeHtml(channel.username)}</code>`,
            streamTitle ? `Тема: <b>${escapeHtml(streamTitle)}</b>` : null,
            '',
            'Можно заходить на канал и присоединяться к трансляции.'
        ].filter(Boolean).join('\n')
    },

    newFollower(follower: TelegramFollowerInfo) {
        return [
            '<b>Новый подписчик</b>',
            '',
            `<b>${escapeHtml(follower.displayName)}</b> подписался на ваш канал.`,
            `Username: <code>${escapeHtml(follower.username)}</code>`
        ].join('\n')
    },

    newSponsorship(plan: TelegramSponsorshipPlanInfo, sponsor: TelegramFollowerInfo) {
        return [
            '<b>Новая спонсорская подписка</b>',
            '',
            `<b>${escapeHtml(sponsor.displayName)}</b> оформил спонсорство на ваш канал.`,
            `Username: <code>${escapeHtml(sponsor.username)}</code>`,
            '',
            `План: <b>${escapeHtml(plan.title)}</b>`,
            `Стоимость: <b>${escapeHtml(formatRubles(plan.price))}</b> в месяц`
        ].join('\n')
    },

    accountVerified(user: TelegramUserInfo) {
        return [
            '<b>Аккаунт верифицирован</b>',
            '',
            `<b>${escapeHtml(user.displayName)}</b>, ваш аккаунт прошел проверку.`,
            `Username: <code>${escapeHtml(user.username)}</code>`,
            '',
            'Теперь профиль получает статус верифицированного аккаунта.'
        ].join('\n')
    },

    enableTwoFactor() {
        return [
            '<b>Рекомендуем включить двухфакторную авторизацию</b>',
            '',
            'Это добавит дополнительную защиту аккаунта при входе.',
            'Включить 2FA можно в настройках безопасности профиля.'
        ].join('\n')
    }
}
