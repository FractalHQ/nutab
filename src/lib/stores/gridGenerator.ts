import { defaultBookmarks } from '$lib/data/bookmarks/defaults'
import { writable, derived } from 'svelte/store'

const gridSettings = {
	gridWidth: 1000,
	gridPadding: 38,
	itemSize: 75
}

export const grid = writable({
	...gridSettings,
	items: defaultBookmarks
})

export const gridDimensions = derived(grid, ($grid) => {
	const { itemSize, gridPadding, gridWidth } = $grid
	const itemCount = $grid.items.length

	// itemSize should include padding
	const totalItemSize = itemSize + gridPadding * 2

	// determine number of columns
	const totalColumns = getItemsPerRow()
	// calculate number of items that fit in 1 row
	function getItemsPerRow() {
		for (let i = 0; i < itemCount; i++) {
			if (totalItemSize * (i + 1) > gridWidth) {
				return i
			}
		}
	}

	// determine number of rows
	const totalRows = Math.ceil(itemCount / totalColumns)

	// measure the leftover space in a row
	const lengthOfItems = totalItemSize * totalColumns
	const remainingSpace = gridWidth - lengthOfItems
	const a = remainingSpace / totalColumns
	const b = a / 4
	const remainingSpacePerItem = parseFloat((a - b).toFixed(10))

	// calculate final cell size
	const cellSize = parseFloat((totalItemSize + remainingSpacePerItem).toFixed(10))
	// calculate the final grid height
	const gridHeight = cellSize * totalRows + remainingSpacePerItem

	// calculate the positions of each item
	let positions = Array(itemCount).fill('')
	function updatePositions() {
		// get x position
		const getPositionInRow = (i: number) =>
			((cellSize * i) % (cellSize * totalColumns - 0.1)) + remainingSpacePerItem

		// get y position
		const getPositionInColumn = (i: number) => Math.floor(i / totalColumns) * cellSize + remainingSpacePerItem

		// store the positions
		positions.forEach((_, i) => {
			positions[i] = {
				item: $grid.items[i]?.title, // Todo: remove this
				x: Math.floor(getPositionInRow(i)),
				y: Math.floor(getPositionInColumn(i))
			}
		})
	}
	updatePositions()

	return {
		lengthOfItems,
		cellSize,
		totalItemSize,
		remainingSpace,
		remainingSpacePerItem,
		totalRows,
		totalColumns,
		gridHeight,
		positions
	}
})
