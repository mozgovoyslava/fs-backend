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
] as const

const nicknameSuffixes = [
	'pilot',
	'caster',
	'maker',
	'runner',
	'forge',
	'quest',
	'signal',
] as const

const generatedUsernames = nicknamePrefixes.flatMap(prefix => {
	return nicknameSuffixes.map(suffix => `${prefix}.${suffix}`)
})

export const seedUsernames = [
	'mozgovoy.only',
	'mozgovoy.vyacheslav',
	...generatedUsernames,
]
