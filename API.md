# API

Документация составлена по текущим resolver/controller файлам и сгенерированной GraphQL-схеме `src/core/graphql/schema.gql`.

## Базовая информация

- Приложение по умолчанию запускается на `http://localhost:4000`.
- GraphQL endpoint: `POST /graphql` (`GRAPHQL_PREFIX=/graphql`).
- GraphQL Playground включается в dev-окружении.
- Аутентификация работает через cookie-сессию. Для защищённых операций клиент должен отправлять cookie вместе с запросом, например `credentials: 'include'`.
- Поля `Upload` используются через multipart GraphQL upload.
- REST webhook endpoints принимают raw body.

Названия операций ниже оставлены ровно как в текущей схеме, включая существующие опечатки: `findSesisonsByUser`, `findRecomendedChannels`, `findChanelByUsername`, `findMySponsorhipPlans`, `cangeStreamInfo`, `changeChatSettinggs`.

## GraphQL Query

| Операция | Аргументы | Auth | Возвращает | Описание |
| --- | --- | --- | --- | --- |
| `findAllCategories` | - | Нет | `[CategoryModel!]!` | Возвращает все категории, отсортированные по `createdAt desc`, вместе со стримами. |
| `findRandomCategories` | `take: Float` | Нет | `[CategoryModel!]!` | Возвращает случайные категории. По умолчанию `take = 4`. |
| `findCategoryBySlug` | `slug: String!` | Нет | `CategoryModel!` | Возвращает категорию по slug вместе со стримами. |
| `findAllStreams` | `filters: StreamFiltersInput!` | Нет | `[StreamModel!]!` | Возвращает стримы не деактивированных пользователей. Поддерживает пагинацию и поиск по названию стрима или username. |
| `findRandomStreams` | `take: Float` | Нет | `[StreamModel!]!` | Возвращает случайные стримы. По умолчанию `take = 4`. |
| `findStreamMessages` | `streamId: String!` | Нет | `[ChatMessageModel!]!` | Возвращает сообщения чата стрима, отсортированные по `createdAt desc`. |
| `findRecomendedChannels` | - | Нет | `[UserModel!]!` | Возвращает до 7 не деактивированных рекомендованных каналов со стримом. |
| `findChanelByUsername` | `username: String!` | Нет | `UserModel!` | Возвращает канал по username, включая social links, stream/category и followings. |
| `findChannelFollowersCount` | `channelId: String!` | Нет | `Float!` | Возвращает количество подписчиков канала. |
| `findProfile` | - | Да | `UserModel!` | Возвращает текущего пользователя из сессии. |
| `findSesisonsByUser` | - | Да | `[SessionModel!]!` | Возвращает остальные активные сессии текущего пользователя, кроме текущей. |
| `findCurrentSession` | - | Да | `SessionModel!` | Возвращает текущую сессию и metadata устройства/location. |
| `findSocialLinks` | - | Да | `[SocialLinkModel!]!` | Возвращает social links текущего пользователя, отсортированные по `position asc`. |
| `generateTotpSecret` | - | Да | `TotpModel!` | Генерирует secret и QR-code URL для включения 2FA. |
| `findMyFollowers` | - | Да | `FollowModel!` | Возвращает подписчиков текущего пользователя. В сервисе формируется список, хотя в схеме указан одиночный `FollowModel`. |
| `findMyFollowings` | - | Да | `FollowModel!` | Возвращает каналы, на которые подписан текущий пользователь. В сервисе формируется список, хотя в схеме указан одиночный `FollowModel`. |
| `findUnreadNotificationsCount` | - | Да | `Float!` | Возвращает количество непрочитанных уведомлений текущего пользователя. |
| `findNotificationsByUser` | - | Да | `[NotificationModel!]!` | Помечает непрочитанные уведомления текущего пользователя как прочитанные и возвращает список по `createdAt desc`. |
| `findMyTransactions` | - | Да | `[TransactionModel!]!` | Возвращает транзакции текущего пользователя. |
| `findMySubscriptions` | - | Да | `[SubscriptionModel!]!` | Возвращает спонсорские подписки на канал текущего пользователя, включая план и спонсора. |
| `findMySponsorhipPlans` | - | Да | `[PlanModel!]!` | Возвращает sponsorship-планы, созданные текущим пользователем как каналом. |

## GraphQL Mutation

| Операция | Аргументы | Auth | Возвращает | Описание |
| --- | --- | --- | --- | --- |
| `createUser` | `data: CreateUserInput!` | Нет | `Boolean!` | Создаёт пользователя, создаёт ему stream, хеширует пароль и отправляет письмо верификации. |
| `verifyAccount` | `data: VerificationInput!` | Нет | `UserModel!` | Подтверждает email по токену, удаляет токен и создаёт сессию. |
| `login` | `data: LoginInput!` | Нет | `AuthModel!` | Логинит по username или email. Если включена 2FA и `pin` не передан, возвращает `message` без пользователя. |
| `logout` | - | Да | `Boolean!` | Уничтожает текущую сессию. |
| `clearSessionCookie` | - | Нет | `Boolean!` | Очищает session cookie на клиенте. |
| `removeSession` | `id: String!` | Да | `Boolean!` | Удаляет чужую активную сессию текущего пользователя. Текущую сессию удалить нельзя. |
| `changeEmail` | `data: ChangeEmailInput!` | Да | `Boolean!` | Меняет email текущего пользователя. |
| `changePassword` | `data: ChangePasswordInput!` | Да | `Boolean!` | Проверяет старый пароль и сохраняет новый пароль. |
| `ResetPassword` | `data: ResetPasswordInput!` | Нет | `Boolean!` | Создаёт password reset token и отправляет письмо для восстановления пароля. |
| `NewPassword` | `data: NewPasswordInput!` | Нет | `Boolean!` | Проверяет password reset token и устанавливает новый пароль. |
| `deactivateAccount` | `data: DeactivateAccountInput!` | Да | `AuthModel!` | Проверяет email/password. Без `pin` отправляет токен деактивации, с `pin` деактивирует аккаунт и завершает сессию. |
| `enableTotp` | `data: EnableTotpInput!` | Да | `Boolean!` | Проверяет 6-значный TOTP-код и включает 2FA. |
| `disableTotp` | - | Да | `Boolean!` | Отключает 2FA и очищает `totpSecret`. |
| `changeProfileAvatar` | `avatar: Upload!` | Да | `Boolean!` | Загружает avatar, конвертирует в WebP 512x512 и сохраняет путь `/channels/{username}.webp`. |
| `removeProfileAvatar` | - | Да | `Boolean!` | Удаляет avatar из S3 и очищает поле `avatar`. |
| `changeProfileInfo` | `data: ChangeProfileInfoInput!` | Да | `Boolean!` | Меняет username, displayName и bio текущего пользователя. |
| `createSocialLink` | `data: SocialLinkInput!` | Да | `Boolean!` | Создаёт social link текущего пользователя со следующей позицией. |
| `reorderSocialLinks` | `list: [SocialLinkOrderInput!]!` | Да | `Boolean!` | Обновляет позиции social links текущего пользователя. |
| `updateSocialLink` | `id: String!`, `data: SocialLinkInput!` | Да | `Boolean!` | Обновляет social link текущего пользователя. |
| `deleteSocialLink` | `id: String!` | Да | `Boolean!` | Удаляет social link текущего пользователя. |
| `cangeStreamInfo` | `data: ChangeStreamInput!` | Да | `Boolean!` | Меняет title и category текущего stream пользователя. |
| `changeStreamThumbnail` | `thumbnail: Upload!` | Да | `Boolean!` | Загружает thumbnail, конвертирует в WebP 1280x720 и сохраняет путь `/streams/{username}.webp`. |
| `removeStreamThumbnail` | - | Да | `Boolean!` | Удаляет thumbnail из S3 и очищает `thumbnailUrl`. |
| `generateStreamToken` | `data: GenerateStreamTokenInput!` | Нет | `GenerateStreamTokenModel!` | Генерирует LiveKit JWT для подключения к комнате канала. Для host identity используется `Host-{userId}`. |
| `createIngress` | `ingressType: Float!` | Да | `Boolean!` | Пересоздаёт LiveKit ingress для текущего пользователя и сохраняет `ingressId`, `serverUrl`, `streamKey`. Значения LiveKit: `0 = RTMP_INPUT`, `1 = WHIP_INPUT`, `2 = URL_INPUT`. |
| `sendChatMessage` | `data: SendMessageInput!` | Да | `ChatMessageModel!` | Создаёт сообщение в чате live-стрима и публикует событие `chatMessageAdded`. |
| `changeChatSettinggs` | `data: ChangeChatSettingsInput!` | Да | `Boolean!` | Меняет настройки чата stream текущего пользователя. |
| `followChannel` | `channelId: String!` | Да | `Boolean!` | Подписывает текущего пользователя на канал и создаёт уведомление о новом подписчике. |
| `unfollowChannel` | `channelId: String!` | Да | `Boolean!` | Отписывает текущего пользователя от канала. |
| `changeNotificationSettings` | `data: ChangeNotificationsSettingsInput!` | Да | `ChangeNotificationSettingsResponse!` | Меняет настройки уведомлений. При включении Telegram без привязанного `telegramId` возвращает `telegramAuthToken`. |
| `createSponsorshipPlan` | `data: CreatePlanInput!` | Да | `Boolean!` | Создаёт месячный sponsorship-план в Stripe и сохраняет его в базе. Доступно только verified-пользователям. |
| `deleteSponsorshipPlan` | `planId: String!` | Да | `Boolean!` | Удаляет sponsorship-план в Stripe и в базе. |
| `makeTransaction` | `planId: String!` | Да | `MakePaymentModel!` | Создаёт Stripe Checkout Session для месячной подписки и сохраняет pending transaction. Возвращает URL оплаты. |

## GraphQL Subscription

| Операция | Аргументы | Auth | Возвращает | Описание |
| --- | --- | --- | --- | --- |
| `chatMessageAdded` | `streamId: String!` | Нет | `ChatMessageModel!` | Публикует новые сообщения чата только для указанного `streamId`. |

## REST Webhooks

| Метод | Endpoint | Headers | Body | Ответ | Описание |
| --- | --- | --- | --- | --- | --- |
| `POST` | `/webhook/livekit` | `Authorization: string` | Raw LiveKit webhook body | `200 OK` | Проверяет LiveKit webhook через `livekitService.receiver`. На `ingress_started` ставит `stream.isLive = true` и уведомляет подписчиков. На `ingress_ended` ставит `isLive = false` и удаляет сообщения чата stream. |
| `POST` | `/webhook/stripe` | `stripe-signature: string` | Raw Stripe webhook body | `true` | Проверяет подпись Stripe через `STRIPE_WEBHOOK_SECRET`. На `checkout.session.completed` помечает transaction как `SUCCESS`, создаёт/обновляет sponsorship subscription и уведомляет канал о новом спонсоре. |

## Telegram Bot Commands

Это не HTTP API, а команды `nestjs-telegraf`.

| Команда | Аргументы | Описание |
| --- | --- | --- |
| `/start` | optional payload token | Без токена показывает инструкцию привязки или данные уже привязанного аккаунта. С токеном `TELEGRAM_AUTH` привязывает Telegram chat к пользователю. |
| `/me` | - | Показывает информацию о привязанном аккаунте. |

## Input Types

### Auth

```graphql
input CreateUserInput {
  username: String! # pattern: /^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/
  email: String!
  password: String! # min length: 8
}

input LoginInput {
  login: String!
  password: String! # min length: 8
  pin: String
}

input ChangeEmailInput {
  email: String!
}

input ChangePasswordInput {
  oldPassword: String! # min length: 8
  newPassword: String! # min length: 8
}

input VerificationInput {
  token: String! # UUID v4
}

input ResetPasswordInput {
  email: String!
}

input NewPasswordInput {
  password: String! # min length: 8
  passwordRepeat: String! # min length: 8, must match password
  token: String! # UUID v4
}

input DeactivateAccountInput {
  email: String!
  password: String! # min length: 8
  pin: String
}

input EnableTotpInput {
  secret: String!
  pin: String! # exactly 6 chars
}
```

### Profile

```graphql
input ChangeProfileInfoInput {
  username: String! # pattern: /^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/
  displayName: String!
  bio: String! # max length: 300 in validator, nullable in TypeScript service
}

input SocialLinkInput {
  title: String!
  url: String!
}

input SocialLinkOrderInput {
  id: String!
  position: Float!
}
```

### Stream and Chat

```graphql
input StreamFiltersInput {
  searchTerm: String
  skip: Float
  take: Float
}

input ChangeStreamInput {
  title: String!
  categoryId: String
}

input GenerateStreamTokenInput {
  channelId: String!
  userId: String!
}

input SendMessageInput {
  streamId: String!
  text: String!
}

input ChangeChatSettingsInput {
  isChatEnabled: Boolean!
  isChatFollowersOnly: Boolean!
  isChatPremiumFollowersOnly: Boolean!
}
```

### Notifications and Sponsorship

```graphql
input ChangeNotificationsSettingsInput {
  siteNotifications: Boolean!
  telegramNotifications: Boolean!
}

input CreatePlanInput {
  title: String!
  description: String
  price: Float!
}
```

## Upload

`changeProfileAvatar` и `changeStreamThumbnail` принимают `Upload!`.

- Поддерживаемые расширения: `jpg`, `jpeg`, `png`, `gif`, `webp`.
- Максимальный размер: `10 MB`.
- Avatar конвертируется в `webp` размером `512x512`.
- Stream thumbnail конвертируется в `webp` размером `1280x720`.

## Основные Return Types

Полная схема находится в `src/core/graphql/schema.gql`. Ниже краткая карта основных типов:

- `AuthModel`: `message`, `user`.
- `UserModel`: пользователь, профиль, настройки, stream, followers/followings. В текущей схеме также отдаются чувствительные поля `password` и `totpSecret`.
- `SessionModel`: `id`, `userId`, `createdAt`, `metadata`.
- `StreamModel`: stream, LiveKit ingress данные, chat settings, category, user.
- `ChatMessageModel`: сообщение чата, stream, user.
- `CategoryModel`: категория и связанные stream.
- `FollowModel`: связь follower/following.
- `NotificationModel`: уведомление пользователя.
- `NotificationSettingsModel`: настройки site/telegram уведомлений.
- `PlanModel`: sponsorship-план канала.
- `TransactionModel`: платежная транзакция, статус `PENDING | SUCCESS | FAILED | EXPIRED`.
- `SubscriptionModel`: sponsorship-подписка пользователя на канал.
- `MakePaymentModel`: `url`.
- `GenerateStreamTokenModel`: `token`.
- `TotpModel`: `qrcodeUrl`, `secret`.
