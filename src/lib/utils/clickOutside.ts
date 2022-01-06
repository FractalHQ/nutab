export function clickOutside(node: Element) {
	const handleClick = (event: MouseEvent) => {
		console.log(event.target)
		if (
			node &&
			!node.contains(event.target as Element) &&
			!event.defaultPrevented &&
			(event.target as Element).id != 'settings-button'
		) {
			node.dispatchEvent(new CustomEvent('click_outside', node))
		}
	}

	document.addEventListener('click', handleClick, true)

	return {
		destroy() {
			document.removeEventListener('click', handleClick, true)
		}
	}
}
