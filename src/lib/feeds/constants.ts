import type { ICategory, IHNItem } from './types'

import { dev } from '$app/environment'

export const DEFAULT_CATEGORY: ICategory = 'topstories'

export const CORS = dev ? 'http://localhost:8080/' : 'https://cors.fractal.workers.dev/?'
// export const CORS = 'https://cors.fractal.workers.dev/?'

export const INITIAL_SIZE = 10

export const BATCH_SIZE = 5

export const MOCK_HN_ITEM: IHNItem = {
	id: -1,
	type: `story`,
	by: '&nbsp;',
	time: Date.now(),
	text: '&nbsp;',
	title: '&nbsp;',
	days_ago: '&nbsp;',
	kids: [],
	meta: {
		url: '&nbsp;',
		title: '&nbsp;',
		description: '&nbsp;',
		icon: '&nbsp;',
		image: '',
	},
}
