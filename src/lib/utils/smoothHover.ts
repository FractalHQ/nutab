let overTimer: NodeJS.Timeout
export function smoothOver(fn: Function, delay = 500, bypass?: boolean) {
	if (bypass) return
	clearTimers()
	overTimer = setTimeout(() => {
		fn()
	}, delay)
}

let outTimer: NodeJS.Timeout
export function smoothOut(fn: Function, delay = 300) {
	clearTimers()
	outTimer = setTimeout(() => {
		fn()
	}, delay)
}

const clearTimers = () => [outTimer, overTimer].forEach((t) => clearTimeout(t))
