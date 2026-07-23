import type { Prisma } from '@prisma/client'

export const categoriesData: Prisma.CategoryCreateManyInput[] = [
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
