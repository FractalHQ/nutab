import type { Bookmark, Folder } from './types'

import { defaultBookmarks, defaultFolder } from './bookmarks/defaults'
import { activeFolder, lastActiveFolderId } from './dbStore'
import { get } from 'svelte/store'
import { log, wait } from 'fractils'
import db from './db'

/**
 * Default bookmark folder and bookmarks db tables.
 * @param  {BookmarkDB} db
 */
export async function initDB() {
	// Add default tables if they don't exist
	// const bookmarksExist = await Dexie.exists('BookmarksDB') // fails
	// const bookmarksExist = (await db.bookmarks.count()) > defaultBookmarks.length
	// Otherwise get the last active folder
	log('🏁 Database found.', '#fa8', 'dimgray', 25)
	await wait(100)
	const id = localStorage.getItem('lastActiveFolderId')
	let lastActiveFolder: Folder | undefined
	lastActiveFolder = await db.table('folders').where('folder_id').equals(id).first()
	log('Last active folder found: ', '#fa8', 'dimgray', 25)
	log(lastActiveFolder)
	activeFolder.set(lastActiveFolder)
}

/**
 * Creates a new bookmark.
 * @param  {bookmark} The bookmark to add.
 */
export async function newBookmark(bookmark: Bookmark) {
	log('🎬 Creating new bookmark: ', '#fa8', 'dimgray', 25)
	log(bookmark)

	// Todo: Consolidate this into a single transaction

	//? Add to bookmarks
	await db.bookmarks.add(bookmark)

	//? Update store
	activeFolder.update((f) => {
		f.bookmarks = [...f.bookmarks, bookmark]
		return f
	})

	//? Update in folder
	await db.folders.update(get(activeFolder), {
		bookmarks: get(activeFolder).bookmarks
	})

	log('🏁 New Bookmark added', '#fa8', 'dimgray', 25)
}

/**
 * Gets bookmark settings.
 * @param  {id} The id of the bookmark to retrieve.
 */
export async function getBookmark(id: Bookmark['bookmark_id']) {
	log(`🎬 Getting bookmark with id of ${id}`, '#fa8', 'dimgray', 25)

	const bookmark = db.bookmarks.where('bookmark_id').equals(id).first()

	log('🏁 Bookmark retrieved:', '#fa8', 'dimgray', 25)
	log(bookmark)

	return bookmark
}
