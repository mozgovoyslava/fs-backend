import { Logger } from '@nestjs/common'
import { PrismaPg } from '@prisma/adapter-pg'
import { type Prisma, PrismaClient } from '@prisma/client'
import { hash } from 'argon2'
import dotenv from 'dotenv'
import { expand } from 'dotenv-expand'
import { Pool } from 'pg'

expand(dotenv.config())

const connectionString = process.env.POSTGRES_URL

if (!connectionString) {
	throw new Error('POSTGRES_URL must be set for database seeding')
}

const pool = new Pool({ connectionString })
const prisma = new PrismaClient({
	adapter: new PrismaPg(pool),
})

const categoriesData: Prisma.CategoryCreateManyInput[] = [
	{
		title: 'Игры',
		slug: 'gaming',
		thumbnailUrl: '/categories/gaming.webp',
		description:
			'Популярные игры, прохождения, кооперативные сессии и вечерний гринд.',
	},
	{
		title: 'Just Chatting',
		slug: 'just-chatting',
		thumbnailUrl: '/categories/just-chatting.webp',
		description:
			'Разговорные эфиры, общение с чатом, новости и уютные обсуждения.',
	},
	{
		title: 'Музыка',
		slug: 'music',
		thumbnailUrl: '/categories/music.webp',
		description:
			'Живые выступления, создание треков, разбор музыки и импровизации.',
	},
	{
		title: 'Киберспорт',
		slug: 'esports',
		thumbnailUrl: '/categories/esports.webp',
		description:
			'Турниры, рейтинговые матчи, тренировки и разбор соревновательных игр.',
	},
	{
		title: 'Программирование',
		slug: 'programming',
		thumbnailUrl: '/categories/programming.webp',
		description:
			'Backend, frontend, pet-проекты, code review и разбор архитектуры.',
	},
	{
		title: 'Обучение',
		slug: 'education',
		thumbnailUrl: '/categories/education.webp',
		description:
			'Учебные эфиры, лекции, разбор сложных тем и совместная практика.',
	},
	{
		title: 'Искусство',
		slug: 'art',
		thumbnailUrl: '/categories/art.webp',
		description:
			'Рисование, дизайн, цифровая живопись, скетчи и творческие челленджи.',
	},
	{
		title: 'Кулинария',
		slug: 'cooking',
		thumbnailUrl: '/categories/cooking.webp',
		description:
			'Домашние рецепты, быстрые ужины, десерты и кулинарные эксперименты.',
	},
	{
		title: 'Фитнес',
		slug: 'fitness',
		thumbnailUrl: '/categories/fitness.webp',
		description:
			'Тренировки, растяжка, здоровые привычки и восстановление формы.',
	},
	{
		title: 'Путешествия',
		slug: 'travel',
		thumbnailUrl: '/categories/travel.webp',
		description:
			'Прогулки по городам, маршруты, поездки и атмосферные места.',
	},
	{
		title: 'Технологии',
		slug: 'technology',
		thumbnailUrl: '/categories/technology.webp',
		description:
			'Гаджеты, AI-инструменты, приложения, железо и домашние серверы.',
	},
	{
		title: 'Кино и сериалы',
		slug: 'movies',
		thumbnailUrl: '/categories/movies.webp',
		description:
			'Обсуждение фильмов, сериалов, трейлеров, теорий и новинок.',
	},
]

const streamTitles: Record<string, string[]> = {
	gaming: [
		'Проходим новый сезон без поражений',
		'Вечерний рейд с подписчиками',
		'Хардкорное выживание до утра',
		'Ранкед без права на ошибку',
		'Открываем редкие сундуки',
		'Финальный босс сегодня падет',
		'Спокойный гринд и общение',
		'Тестируем новую мету',
		'Играю впервые, без спойлеров',
		'Ночной кооп с друзьями',
	],
	'just-chatting': [
		'Уютный разговор обо всем',
		'Разбираем новости за неделю',
		'Вопросы и ответы без фильтров',
		'Истории из жизни и чай',
		'Смотрим мемы и болтаем',
		'Планируем неделю вместе',
		'Ночной разговорный эфир',
		'Обсуждаем ваши идеи',
		'Стрим без сценария',
		'Доброе утро, чат',
	],
	music: [
		'Пишем бит с нуля',
		'Гитарный вечер на расслабоне',
		'Разбор любимых треков',
		'Импровизация в прямом эфире',
		'Собираем плейлист недели',
		'Записываем вокал дома',
		'Lo-fi сессия для работы',
		'Учимся играть новый трек',
		'Музыкальные заявки из чата',
		'Синтезаторы и эксперименты',
	],
	esports: [
		'Тренировка перед турниром',
		'Разбор ошибок после матча',
		'Смотрим финал и анализируем',
		'Ранкед до нового дивизиона',
		'Командная практика в прямом эфире',
		'Топовые моменты недели',
		'Учимся играть как про',
		'Тактика для следующего матча',
		'Дуо-катка на максимум',
		'Путь к чемпионству',
	],
	programming: [
		'Пишем backend на NestJS',
		'Фиксим баги в прямом эфире',
		'Собираем GraphQL API',
		'Рефакторинг без боли',
		'Делаем авторизацию с нуля',
		'Пишем frontend-компоненты',
		'Разбираем Prisma и PostgreSQL',
		'Code review подписчиков',
		'Пет-проект за вечер',
		'Оптимизируем медленные запросы',
	],
	education: [
		'Учимся быстрее запоминать',
		'Разбор сложной темы простыми словами',
		'Готовимся к экзамену вместе',
		'Английский без скуки',
		'Математика на практике',
		'История за один вечер',
		'План обучения на месяц',
		'Разбираем домашку',
		'Полезные привычки для учебы',
		'Как не выгорать во время обучения',
	],
	art: [
		'Рисуем персонажа с нуля',
		'Скетчи по идеям чата',
		'Цифровая живопись вечером',
		'Делаем обложку для стрима',
		'Арт-челлендж на час',
		'Разбор работ подписчиков',
		'Учимся цвету и свету',
		'Пиксель-арт без спешки',
		'Создаем концепт мира',
		'Рисуем эмоции персонажей',
	],
	cooking: [
		'Готовим ужин за 30 минут',
		'Домашняя пицца с нуля',
		'Пробуем новый рецепт',
		'Завтрак как в кафе',
		'Готовим без лишней посуды',
		'Десерт к вечернему чаю',
		'Острая кухня сегодня',
		'Меню на неделю',
		'Кулинарный эксперимент',
		'Готовим вместе с чатом',
	],
	fitness: [
		'Утренняя тренировка дома',
		'Растяжка после рабочего дня',
		'Кардио без оборудования',
		'Силовая тренировка на час',
		'Возвращаем форму спокойно',
		'Тренировка для новичков',
		'Разбираем технику упражнений',
		'Йога и дыхание',
		'План питания и привычки',
		'Челлендж на выносливость',
	],
	travel: [
		'Прогулка по новому городу',
		'Планируем путешествие мечты',
		'Лучшие места для выходных',
		'Собираем чемодан без паники',
		'Живой маршрут на сегодня',
		'Кафе, улицы и атмосфера',
		'Бюджетное путешествие',
		'Истории из поездок',
		'Смотрим красивые локации',
		'Путешествие без туристических ловушек',
	],
	technology: [
		'Тестируем новый гаджет',
		'Разбираем полезные приложения',
		'Новости технологий за неделю',
		'Собираем рабочее место',
		'AI-инструменты на практике',
		'Настраиваем домашний сервер',
		'Смартфоны, ноутбуки и железо',
		'Кибербезопасность простыми словами',
		'Автоматизируем рутину',
		'Техно-вопросы из чата',
	],
	movies: [
		'Обсуждаем новинки кино',
		'Сериалы, которые стоит посмотреть',
		'Разбор финала без спойлеров',
		'Кино-вечер с чатом',
		'Любимые сцены и детали',
		'Что посмотреть на выходных',
		'Рейтинг фильмов месяца',
		'Классика, которую пропустили',
		'Теории по сериалам',
		'Разбираем трейлеры',
	],
}

const nicknamePrefixes = [
	'aurora',
	'pixel',
	'code',
	'night',
	'solar',
	'lunar',
	'storm',
	'nova',
	'ember',
	'crystal',
	'shadow',
	'silver',
	'golden',
	'wild',
]

const nicknameSuffixes = [
	'pilot',
	'caster',
	'maker',
	'runner',
	'forge',
	'quest',
	'signal',
]

const generatedUsernames = nicknamePrefixes.flatMap(prefix => {
	return nicknameSuffixes.map(suffix => `${prefix}.${suffix}`)
})

const usernames = [
	'mozgovoy.only',
	'mozgovoy.vyacheslav',
	...generatedUsernames,
]

function getRandomItem<T>(items: T[]): T {
	return items[Math.floor(Math.random() * items.length)]
}

function toDisplayName(username: string) {
	return username
		.split(/[.-]/)
		.map(part => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
		.join(' ')
}

function toSocialHandle(username: string) {
	return username.replace(/[^a-zA-Z0-9_]/g, '')
}

async function main() {
	try {
		Logger.log('Starting database seed')

		await prisma.$transaction([
			prisma.token.deleteMany(),
			prisma.socialLink.deleteMany(),
			prisma.stream.deleteMany(),
			prisma.user.deleteMany(),
			prisma.category.deleteMany(),
		])

		await prisma.category.createMany({
			data: categoriesData,
		})

		const categories = await prisma.category.findMany()
		const password = await hash('12345678')

		await prisma.$transaction(async tx => {
			for (const username of usernames) {
				const randomCategory = getRandomItem(categories)
				const randomTitles =
					streamTitles[randomCategory.slug] ?? streamTitles.gaming
				const randomTitle = getRandomItem(randomTitles)
				const socialHandle = toSocialHandle(username)

				const createdUser = await tx.user.create({
					data: {
						email: `${username}@gmail.com`,
						password,
						username,
						displayName: toDisplayName(username),
						avatar: `/channels/${username}.webp`,
						bio: 'Моковый пользователь для локальной разработки и демо-данных',
						isEmailVerified: true,
						socialLinks: {
							createMany: {
								data: [
									{
										title: 'Telegram',
										url: `https://t.me/${socialHandle}`,
										position: 1,
									},
									{
										title: 'YouTube',
										url: `https://youtube.com/@${socialHandle}`,
										position: 2,
									},
								],
							},
						},
						stream: {
							create: {
								title: randomTitle,
								thumbnailUrl: `/streams/${username}.webp`,
								isLive: false,
								category: {
									connect: {
										id: randomCategory.id,
									},
								},
							},
						},
					},
				})

				Logger.log(`Created user ${createdUser.username} with stream`)
			}
		})

		Logger.log('Database seed completed')
	} catch (error) {
		Logger.error(error)
		throw error
	} finally {
		Logger.log('Closing database connection...')
		await prisma.$disconnect()
		await pool.end()
		Logger.log('Database connection closed')
	}
}

main()
