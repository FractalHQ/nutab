import { default_settings } from '$lib/stores/settingsStore'
import { settings } from '$lib/stores'
import { get } from 'svelte/store'
import { log } from 'fractils'

export const addMissingSettings = async () => {
	const s = get(settings)

	try {
		for (const setting of Object.entries(default_settings)) {
			if (!(setting[0] in s)) {
				log('Missing Setting Found:')
				log(`Adding missing setting: ${setting[0]}`)
				settings.update((_s) => {
					_s[setting[0]] = setting[1]
					return _s
				})
			}
		}
	} catch (err) {
		log('Error adding missing settings:', 'tomato', 'black')
		log(err)
	}

	return true
}
