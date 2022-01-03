const mapRange = (value: number, x1: number, x2: number, y1: number, y2: number) =>
	((value - x1) * (y2 - y1)) / (x2 - x1) + y1

export const gradient = (i: number, total: number) =>
	`hsl(${mapRange(-i / 5 + 50, 0, total, 0, 360)}, 50%, ${mapRange(i, 0, total, 25, 75)}%)`

export const wait = (t: number) => new Promise((res) => setTimeout(res, t))

const randomId = () => Math.floor(Math.random() * 100)
const randomColor = () => Math.floor(Math.random() * 16777215).toString(16)
export const exampleArray = ((itemCount = 30) => {
	let items = Array(itemCount).fill('')
	items.forEach((item, i) => {
		items[i] = {
			id: randomId(),
			title: `item ${i}`,
			color: `#${randomColor()}`,
			position: i
		}
	})
	return items
})()
