import type { Bookmark, Folder, FolderListItem } from './types'

import {
	activeFolderBookmarks,
	lastActiveFolderId,
	activeBookmarks,
	activeFolder,
	tagFilter,
	folders,
} from './dbStore'
import { log, wait } from 'fractils'
import { get } from 'svelte/store'
import cuid from 'cuid'
import db from './db'

let loopguard = 0

/**
 ** Load bookmarks, or generate default bookmarks if none exist.
 */
export async function init_db() {
	// Get the last active folder
	log('🏁 Database found.', '#fa8', 'dimgray', 25)
	await wait(100)
	const id = get(lastActiveFolderId)

	// Populate stores
	let lastActiveFolder: Folder | undefined
	lastActiveFolder = await db.table('folders').where('folder_id').equals(id).first()

	// If no last active folder, use the first one
	// All of this might not be necessary, but.. edge cases are.. edge cases
	if (!lastActiveFolder) {
		const defaultFolder = await db.table('folders').toArray()
		if (defaultFolder.length > 0) {
			localStorage.removeItem('lastActiveFolderId')
			lastActiveFolder = defaultFolder[0]
		} else {
			localStorage.removeItem('lastActiveFolderId')
			loopguard++
			if (loopguard === 0) {
				init_db()
				return
			} else {
				console.error('❌ No folders found in database... this shouldn\'t happen.  Try clearing local storage to delete / reset all data.')
				return
			}
		}
	}

	activeFolder.set(lastActiveFolder)
	activeBookmarks.set(await db.bookmarks.bulkGet(lastActiveFolder.bookmarks))
	folders.set(await db.table('folders').toArray())
}

/**
 ** Creates a new bookmark.
 * @param bookmark - The bookmark to add.
 */
export async function newBookmark_db(bookmark: Bookmark) {
	log('🎬 Creating new bookmark: ', '#fa8', 'dimgray', 25)

	// Todo: Consolidate this into a single transaction?

	// Add to bookmarks table
	await db.bookmarks.put(bookmark).catch((e) => console.warn('Error adding bookmark', e, bookmark))

	// Add id to activeFolder store
	activeFolder.update((f) => {
		f.bookmarks.push(bookmark.bookmark_id)
		return f
	})

	const folder = get(activeFolder)
	// Replace Folder table's bookmarks with new array
	await db.folders.update(folder, {
		bookmarks: folder.bookmarks
	}).catch((e) => console.warn('Error updating folder', e, folder))

	// Update activeBookmarks store
	if (get(tagFilter) === null) {
		activeBookmarks.set(get(activeFolderBookmarks))
	}

	log('🏁 New Bookmark added', '#fa8', 'dimgray', 25)
}

/**
 ** Creates a new folder.
 * @param folder - The folder to add.
 */
export async function newFolder_db(folder: Folder) {
	log('🎬 Creating new folder: ', '#fd8', '#333', 25)

	// Todo: Consolidate this into a single transaction?

	// Clear any filters
	tagFilter.set(null)

	// Add to folders table
	await db.folders.add(folder)

	// Set activeFolder store
	activeFolder.set(folder)

	// Update activeBookmarks store
	activeBookmarks.set(await db.bookmarks.bulkGet(folder.bookmarks))

	// Update folders store
	folders.set(await getAllFolders_db())

	log('🏁 New Folder added', '#fd8', '#333', 25)
}

/**
 ** Get's the id's of any bookmarks containing a tag from an array of tags
 * @param tags An array of tags
 * @returns An array of bookmark ids
 */
export const getBookmarksWithSelectedTags_db = async (tags: string[]): Promise<Bookmark['bookmark_id'][]> => {
	// Get all relevant bookmarks
	const allBookmarks = await db.bookmarks.where('tags').anyOf(tags).toArray()
	
	// Filter out duplicates (some share multiple tags)
	const uniques = new Set()
	const bookmarks = allBookmarks.reduce((prev, curr) => {
		if (!uniques.has(curr.title)) {
			uniques.add(curr.title)
			prev = [...prev, curr]
			log(prev)
		} else log(`Found duplicate: ${curr.title}`)
		return prev
	}, [])
	
	// Give them unique id's so they can be deleted without affecting other folders.
	bookmarks.forEach((b) => {
		b.bookmark_id = cuid()
	})
	// Add them to the bookmarks table
	await db.bookmarks.bulkAdd(bookmarks)

	return bookmarks.map((b) => b.bookmark_id)
}

/**
 ** Gets bookmark settings.
 * @param id - The id of the bookmark to retrieve.
 */
export async function getBookmark_db(id: Bookmark['bookmark_id']) {
	log(`🎬 Getting bookmark with id of ${id}`, '#fa8', 'dimgray', 25)

	return db.bookmarks.where('bookmark_id').equals(id).first()
}

/**
 *
 ** Get's all folders.
 * @returns All folders
 */
export const getAllFolders_db = async (): Promise<FolderListItem[]> => {
	log('Getting folders')
	const allFolders: Folder[] = await db.folders.toArray()
	return allFolders.map((f) => ({ folder_id: f.folder_id, icon: f.icon, title: f.title }))
}

/**
 ** Gets folder settings.
 * @param id - The id of the folder to retrieve.
 */
export const getFolder_db = async (id: Folder['folder_id']) => {
	log(`🎬 Getting folder with id of ${id}`, '#fa8', 'dimgray', 25)

	return db.folders.where('folder_id').equals(id).first()
}

/**
 ** Counts total folders.
 * @returns The number of folders in the database.
 */
export const getFolderCount_db = () => db.folders.count()

/**
 ** Updates the db after an index/position swap.
 */
export const swapBookmarks_db = async (bookmarks: Bookmark[]) => {
	return new Promise((resolve) => {
		// Update each bookmark to store the new position
		bookmarks.forEach((b) => {
			db.bookmarks.put(b)
		})

		// Update in folder (activeBookmarks store is already updated)
		db.folders
			.update(get(activeFolder), {
				bookmarks: get(activeBookmarks).map((b) => b.bookmark_id)
			})
			.then(resolve)
	})

	// // Update activeFolder
	// activeFolder.set(get(activeFolder))
}

/**
 ** Deletes a bookmark.
 * @param id - The id of the bookmark to delete.
 */
export const deleteBookmark_db = async (id: Bookmark['bookmark_id']) => {
	log(`🎬 Deleting bookmark with id of ${id}`, '#fa8', 'dimgray', 25)

	const bookmarks = get(activeBookmarks)

	// Remove from bookmarks store and update positions
	let found = false
	bookmarks.forEach((b, i) => {
		if (id === b.bookmark_id) {
			bookmarks.splice(i, 1)
			found = true
		}
		if (found) b.position = i
	})

	// Update folder store
	activeFolder.update((f) => {
		f.bookmarks = bookmarks.map((b) => b.bookmark_id)
		return f
	})

	// Update bookmarks store
	activeBookmarks.set(bookmarks)

	// Delete from bookmarks table
	await db.bookmarks.delete(id)

	// Replace bookmarks db table to update positions
	await db.bookmarks.bulkPut(bookmarks)

	// Update folder table
	await db.folders.update(get(activeFolder), { bookmarks: bookmarks.map((b) => b.bookmark_id) })

	log('🏁 Bookmark deleted', '#fa8', 'dimgray', 25)
}

/**
 ** Deletes a folder
 * @param folder - The folder to delete.
 */
export async function deleteFolder_db(folder: Folder) {
	const id = folder.folder_id
	log(`🎬 Deleting folder "${folder.title}" with id of ${id}`, '#fa8', 'dimgray', 25)

	const before = await db.bookmarks.count()

	// Remove the folder's bookmarks
	await db.bookmarks.bulkDelete(folder.bookmarks)
	const after = await db.bookmarks.count()
	log('🏁 Removed ' + (before - after) + ' bookmarks', '#fa8', 'dimgray', 25)

	// Delete from folders table
	await db.folders.delete(id)

	// Update activeFolder store if the deleted folder was active
	if (get(activeFolder).folder_id === id) {
		const fallbackFolder = await db.folders.orderBy('folder_id').first()
		activeFolder.set(fallbackFolder)		
		lastActiveFolderId.set(fallbackFolder.folder_id)
	}

	// Update folders store
	folders.set(await getAllFolders_db())

	log('🏁 Folder deleted', '#fa8', 'dimgray', 25)
}

/**
 ** Updates a bookmark.
 * @param bookmark - The bookmark to update.
 */
export async function updateBookmark_db(bookmark: Bookmark) {
	log('🎬 Updating bookmark: ', '#fa8', 'dimgray', 25)
	log(bookmark)

	await db.bookmarks.put(bookmark)
	activeBookmarks.update((v) => v.map((b) => (b.bookmark_id === bookmark.bookmark_id ? bookmark : b)))

	log('🏁 Bookmark updated', '#fa8', 'dimgray', 25)
}

/**
 ** Updates a folder.
 * @param folder - The folder to update.
 */
export async function updateFolder_db(folder: Folder) {
	log('🎬 Updating folder: ', '#fa8', 'dimgray', 25)
	log(folder)

	await db.folders.put(folder)

	// Update activeFolder store if it's the same as the one being updated
	if (get(activeFolder).folder_id == folder.folder_id) activeFolder.set(folder)

	// Update folders store
	folders.set(await getAllFolders_db())

	log('🏁 Folder updated', '#fa8', 'dimgray', 25)
}
