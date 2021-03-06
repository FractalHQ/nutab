<script lang="ts">
	// Data
	import { showBookmarkEditor, bookmarkEditor, editor, editorContext } from '$lib/stores/bookmarkEditor'
	import { newBookmark_db, updateBookmark_db } from '$lib/data/transactions'
	import { reRender } from '$lib/stores/gridStore'
	import { uniqueTags } from '$lib/data/dbStore'

	// Components
	import BookmarkArt from '$lib/ui/Bookmarks/BookmarkArt.svelte'
	import ImageURL from '$lib/ui/Bookmarks/ImageURL.svelte'
	import DeleteBookmark from './DeleteBookmark.svelte'
	import Tags from '$lib/ui/Bookmarks/Tags.svelte'
	import Button from '$lib/ui/Button.svelte'

	// Utils
	import { fade } from 'svelte/transition'
	import { onMount } from 'svelte'
	import Tooltip from '../Tooltip.svelte'
	import { wait } from 'fractils'

	export let i: number = 0
	// export let bookmark_id: string = ''

	let titleInput: HTMLInputElement
	let urlInput: HTMLInputElement
	let descriptionInput: HTMLInputElement
	let descriptionFocused = false
	$: placeholder = descriptionFocused ? '' : 'description'
	$: icon = ''
	$: if ($bookmarkEditor?.['url']) {
		const basename = $bookmarkEditor?.['url'].split('://')[1].split('.')[0] || ''
		icon = `https://cdn.cdnlogo.com/logos/a/1/${basename.split('.')[0]}-icon.svg`
	}

	let hoveringAI = false

	let tag = ''
	function handleTags(event: CustomEvent) {
		tag = event.detail.tags
	}
	async function updateTags(event: CustomEvent, index: number, id: string) {
		$bookmarkEditor['tags'] = event.detail.tags
	}

	async function handleSave() {
		if (!$bookmarkEditor.url) {
			urlInput.style.border = '1px solid var(--warn)'
			await wait(1000)
			urlInput.style.border = '1px solid transparent'
			return
		}
		if ($editorContext === 'edit') {
			updateBookmark_db($bookmarkEditor)
		} else {
			await newBookmark_db($bookmarkEditor)
		}
		editor.hide()
		$reRender = !$reRender
	}

	onMount(async () => {
		if ($editorContext === 'create') titleInput?.select()
	})

	let open = false // for ImageURL input
</script>

{#if $showBookmarkEditor && $bookmarkEditor}
	<div class="editor-container" out:fade={{ duration: 100 }}>
		<div class="image-container">
			{#if $bookmarkEditor['image'] || $bookmarkEditor['autoImage']}
				<div class="img-overlay">
					<img name="image" src={$bookmarkEditor['image'] || icon} alt={$bookmarkEditor['title']} />
					<ImageURL bind:open urlActive={true} />
				</div>
			{:else}
				<ImageURL bind:open urlActive={false} />
				<div class="bookmark-art">
					<BookmarkArt
						--foreground={$bookmarkEditor['foreground']}
						--background={$bookmarkEditor['background']}
						--size="100px"
						--margin="2rem auto"
						--shadow=" 0px 4.7px 10px -3px rgba(0, 0, 0, 0.275),
				0px 7.3px 5.6px -1px rgba(0, 0, 0, 0.09), 0px 14px 15px -1px rgba(0, 0, 0, 0.14)"
						title={$bookmarkEditor['title']}
					/>
					<div class="color-settings">
						<input name="background" type="color" bind:value={$bookmarkEditor['background']} />
						<input name="foreground" type="color" bind:value={$bookmarkEditor['foreground']} />
						<Tooltip content="Custom_image_URL">
							<div class="image-url-link-icon" on:click={() => (open = !open)}>🔗</div>
						</Tooltip>
					</div>
				</div>
			{/if}
			<div class="auto-image checkbox">
				<label class:hoveringAI for="auto-image">Auto Image</label>
				<!-- svelte-ignore a11y-mouse-events-have-key-events -->
				<div
					class="radio"
					on:mouseover={() => (hoveringAI = true)}
					on:mouseout={() => (hoveringAI = false)}
					on:click={() => ($bookmarkEditor['autoImage'] = !$bookmarkEditor['autoImage'])}
				>
					<div class="circle" class:checked={$bookmarkEditor['autoImage']} />
				</div>
			</div>
		</div>
		<div class="setting title">
			<input
				name="title"
				placeholder="title"
				bind:this={titleInput}
				bind:value={$bookmarkEditor['title']}
				on:click={() => titleInput.select()}
				on:keydown={(e) => e.key === 'Enter' && handleSave()}
			/>
		</div>

		<div class="setting description">
			<input
				name="description"
				{placeholder}
				type="text"
				bind:this={descriptionInput}
				bind:value={$bookmarkEditor['description']}
				on:focus={() => {
					descriptionFocused = true
				}}
				on:blur={() => {
					descriptionFocused = false
				}}
			/>
		</div>

		<div class="setting">
			<input
				name="url"
				type="text"
				placeholder="url"
				bind:this={urlInput}
				on:click={() => urlInput.select()}
				bind:value={$bookmarkEditor['url']}
				autoComplete="off"
			/>
		</div>

		<div class="setting">
			<div name="tags" class="tags">
				<Tags
					on:updateTags={(e) => updateTags(e, i, $bookmarkEditor.bookmark_id)}
					bind:tags={$bookmarkEditor['tags']}
					placeholder={'new tag'}
					on:tags={handleTags}
					autoComplete={$uniqueTags ? $uniqueTags : false}
					allowPaste={true}
					onlyUnique={true}
					removeKeys={[46]}
					addKeys={[9, 13]}
					allowDrop={true}
					allowBlur={true}
					splitWith={'/'}
					name={'tags'}
					maxTags={10}
					minChars={2}
					id="editor"
				/>
			</div>
		</div>

		<div class="buttons">
			<Button --colorHover="var(--warn)" --borderHover="1px solid var(--warn)" on:click={() => editor.hide()}>
				Cancel
			</Button>
			<Button --colorHover="var(--confirm)" --borderHover="1px solid var(--confirm)" on:click={handleSave}>
				Save
			</Button>
			<DeleteBookmark bookmark_id={$bookmarkEditor.bookmark_id} on:close={() => editor.hide()} />
		</div>
	</div>
{/if}

<style lang="scss">
	.editor-container {
		display: flex;
		position: relative;
		flex-direction: column;

		width: 500px;
		height: max-content;
		margin: 30vh auto;

		border-radius: 10px;
		background: var(--light-a);
		color: var(--dark-a);
		box-shadow: 0 5px 15px 5px #00000011;

		perspective: 1200px;
		transform-style: preserve-3d;

		animation: floatUp ease-out 500ms forwards;
		animation-timing-function: cubic-bezier(0.175, 0.585, 0.52, 1);

		/* 3d CSS Float Down Animation */
		@keyframes floatUp {
			0% {
				opacity: 0;

				transform: perspective(500px) translate3d(0, -5px, -50px);
			}
			100% {
				opacity: 1;

				transform: perspective(500px) translate3d(0, 0, 0);
			}
		}
	}

	.setting {
		display: flex;
		position: relative;
		justify-content: space-around;

		font-size: 1.3rem;

		z-index: 12;
	}

	input {
		width: 60%;
		padding: 5px 8px 5px 8px;

		color: var(--dark-a);
		border: 1px solid rgba(var(--light-b-rgb), 0);
		border-radius: 3px;
		outline: none;
		background: var(--light-a);

		font-family: 'Abel';
		font-size: 1rem;
		text-align: center;

		transition: border 0.2s;

		&:focus {
			&::placeholder {
				opacity: 0;
			}
		}
		&:focus,
		&:hover {
			border-bottom: 1px solid rgba(var(--light-b-rgb), 1);
		}
	}

	input[name='title'] {
		font-size: 1.5rem;
	}
	input[name='url'] {
		margin: auto;
		margin-bottom: 1.1rem;

		color: var(--dark-d);

		font: 0.8rem monospace;
	}

	input[name='description'] {
		margin: 0 auto 2rem auto;

		color: rgba(var(--dark-d-rgb), 0.75);

		&::placeholder {
			color: rgba(var(--dark-d-rgb), 0.25);
		}
	}

	input[type='color'] {
		width: 30px;
		height: 30px;
		padding: 0;

		opacity: 0.2;
		&:hover {
			opacity: 1;
		}

		transition: opacity 0.2s;
		cursor: pointer;
	}

	.tags {
		position: relative;

		width: 90%;
		height: 100%;
		margin: 1rem auto;

		font-family: var(--font-a);
	}

	.buttons {
		display: grid;
		position: relative;
		grid-template-columns: 1fr 1fr;
		align-items: flex-end;
		justify-items: center;

		width: 15rem;
		margin: 2rem auto;

		gap: 1rem;

		z-index: 11;
	}

	.bookmark-art {
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;

		margin: 2rem auto;
		perspective: 1200px;
		transform-style: preserve-3d;

		animation: floatDown ease-out 1.25s forwards;

		animation-timing-function: cubic-bezier(0.175, 0.885, 0.32, 1);
	}

	.color-settings {
		position: absolute;
		top: 1.75rem;
		bottom: 0;
		left: 0;
		right: -10rem;
		display: flex;
		flex-direction: column;

		width: max-content;
		margin: auto;
	}

	.image-container {
		position: relative;
	}

	.auto-image {
		& .radio {
			position: absolute;
			top: 37%;
			left: 30%;
			margin-left: auto;
			z-index: 50;
			pointer-events: all;
		}
		& label {
			position: absolute;
			left: 11%;
			top: 34.5%;
			color: var(--dark-d);
			font-size: 15px;
			opacity: 0;
			transition: opacity 0.25s;
			&.hoveringAI {
				opacity: 1;
			}
			width: 150%;
		}
	}

	img {
		display: flex;

		width: auto;
		height: 100px;
		margin: 2.5rem auto 0.5rem auto;

		animation: floatDown 1s forwards;

		animation-timing-function: cubic-bezier(0.175, 0.985, 0.12, 1);
	}

	.img-overlay {
		display: flex;
		align-items: center;
		position: relative;
		width: max-content;
		height: max-content;
		min-height: 192px;
		margin: 0 auto;
	}

	.image-url-link-icon {
		opacity: 0.5;
		text-align: center;
		cursor: pointer;
		padding-top: 0.25rem;

		&:hover {
			opacity: 1;
		}
	}

	/* 3d CSS Float Down Animation */
	@keyframes floatDown {
		0% {
			opacity: 0;

			transform: perspective(500px) translate3d(0, -25px, 50px) scale(1.2);
		}
		100% {
			opacity: 1;

			transform: perspective(500px) translate3d(0, 0, 0) scale(1);
		}
	}
</style>
