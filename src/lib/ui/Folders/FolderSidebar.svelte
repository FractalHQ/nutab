<script lang="ts">
	// Types
	import type { Folder } from '$lib/data/types'

	// Data
	import { activeFolder } from '$lib/data/dbStore'
	import db from '$lib/data/db'

	// Utils
	import { fly, fade } from 'svelte/transition'
	import { onMount } from 'svelte'

	// Components
	import Tooltip from '$lib/ui/Tooltip.svelte'

	let folderIcons = []

	interface FolderListItem {
		folder_id: Folder['folder_id']
		title: Folder['title']
		icon: Folder['icon']
	}

	let folders: FolderListItem[]

	const getFolders = async () => {
		const allFolders: Folder[] = await db.folders.toArray()
		folders = allFolders.map((f) => ({ folder_id: f.folder_id, icon: f.icon, title: f.title }))
		console.log(folders)
	}

	onMount(() => {
		getFolders()
	})

	let hovering = false
	let sidebar: HTMLElement

	$: isActive = (id: Folder['folder_id']) => id === $activeFolder?.folder_id
</script>

<!-- svelte-ignore a11y-mouse-events-have-key-events -->
<template lang="pug">
	
	.folder-sidebar-container
		.folder-sidebar(
			bind:this='{sidebar}'
			class:hovering
			on:mouseover!='{() => hovering = true}'
			on:mouseout!='{e => e.target != sidebar ? null : hovering = false}'
		)
			+if ('folders')
				+each('folders as folder')
					.folder
						.folder-icon {folder.icon}
						.folder-title(class:hovering) {folder.title}
			.new-folder(class:hovering) 
				Tooltip(content='New_Folder' position='right' offset='{[9,20]}') +

</template>

<style lang="scss">
	.folder-sidebar-container {
		position: absolute;
		display: flex;
		align-items: center;
		left: 0;

		height: 100vh;
		width: 200px;

		z-index: 0;
	}
	.folder-sidebar {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;

		height: max-content;
		min-width: 200px;
		padding: 3rem 2rem 3rem 0;

		// border: 1px solid pink;

		& .folder {
			display: flex;
			flex-direction: row;
			align-items: center;
			flex-grow: 1;
			gap: 0.5rem;

			margin: 1rem;
			margin-left: 0;

			// border: 1px solid lightgreen;

			cursor: pointer;

			& .folder-title {
				color: var(--dark-c);
				opacity: 0;

				font-family: var(--font-secondary);
				font-size: 1.25rem;

				transform: translateX(5px);
				transition: 0.2s;

				&.hovering {
					opacity: 1;

					transform: translateX(0px);
				}
			}
			& .folder-icon {
				font-size: 1.5rem;
				filter: saturate(0);

				transition: 0.25s;
			}
		}
		&.hovering {
			& .folder-icon {
				filter: saturate(1);
			}
			& .new-folder {
				opacity: 1;

				transition-delay: 0.5s;
			}
		}

		& .new-folder {
			position: absolute;
			left: 2.2rem;
			bottom: 1rem;

			margin: auto;
			width: fit-content;
			height: fit-content;

			color: var(--light-d);
			opacity: 0;

			font-size: 1.5rem;

			cursor: pointer;

			transition: 0.2s;
		}
	}
</style>