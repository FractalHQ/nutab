<script lang="ts">
	import { createUser } from '$lib/data/sync'

	import { userPhrase, userEmail } from '$lib/data/user'
	import Button from '$lib/ui/Button.svelte'
	import Tooltip from '$lib/ui/Tooltip.svelte'
	import { quintOut } from 'svelte/easing'
	import { fade, fly } from 'svelte/transition'

	let revealPhrase = false
	let email = ''
</script>

<div class="account">
	{#if $userPhrase?.length}
		{#key revealPhrase}
			{#if revealPhrase}
				<div class="phrase">
					{#each $userPhrase as word, i}
						<div
							class="word"
							in:fly={{ y: 5, delay: 100 + 10 * i, duration: 750 }}
							out:fly={{ y: -5, delay: 10 * ($userPhrase.length - i), duration: 750 }}
						>
							{word}
						</div>
					{/each}
					<Tooltip content="Hide_Passphrase" delay={[300, 100]}>
						<div
							class="hide"
							transition:fly={{ x: 10, delay: 250, duration: 200, easing: quintOut }}
							on:click={() => (revealPhrase = false)}
						>
							👁
						</div>
					</Tooltip>
				</div>
				{#if !$userEmail}
					<div class="email" transition:fade={{ duration: 150 }}>
						<p>
							Add a recovery email <span class="note">(optional)</span>
						</p>

						<input bind:value={email} placeholder="Email" type="email" required />

						<!-- TODO -->
						<!-- <button on:click={() => postUserEmail(email)}>Add</button> -->

						<p class="note">A recovery email can be used to recover a lost passphrase.</p>
					</div>
				{/if}
			{:else}
				<div class="reveal" in:fade={{ delay: 750 }} out:fade={{ duration: 250 }}>
					<Button --width="14rem" on:click={() => (revealPhrase = true)}>Reveal secret passphrase</Button>
				</div>
			{/if}
		{/key}
	{:else}
		<div class="account new">
			<p>Sync your data across browsers.</p>
			<input bind:value={email} placeholder="Recovery Email (optional)" type="email" required />
			<div class="button">
				<Button --width="10rem" --bgHover="var(--dark-a)" on:click={() => createUser(email)}>
					New Sync Code
				</Button>
			</div>
		</div>
		<div class="br-md" />
		<div class="account existing">
			<p>Already have a Sync Code?</p>
			<div class="button">
				<Button --width="10rem" --bgHover="var(--dark-a)" on:click={() => createUser(email)}>Connect</Button>
			</div>
		</div>
	{/if}
</div>

<style lang="scss">
	.account {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;

		min-height: 95%;
	}

	.phrase {
		display: grid;
		grid-template-columns: repeat(5, auto);
		grid-template-rows: auto;
		column-gap: 15px;
		row-gap: 25px;

		max-width: 80%;

		color: var(--dark-a);

		font-size: 1.2rem;
		font-family: var(--font-b);
		text-align: center;

		.hide {
			cursor: pointer;
			opacity: 0.25;
			filter: saturate(0);

			transition: 0.3s;

			&:hover {
				opacity: 1;
				filter: saturate(1);
			}
		}
	}

	.reveal {
		position: absolute;
		inset: 0;
		margin: auto;
		width: max-content;
		height: 60%;
	}

	p {
		font-family: var(--font-a);
		color: var(--dark-d);

		text-align: center;
	}

	input {
		font-family: var(--font-a);
		color: var(--dark-a);
		background-color: rgba(var(--light-c-rgb), 0.25);
		border: none;
		border-radius: 0.5rem;
		padding: 0.5rem 1rem;
		width: 20rem;

		&::placeholder {
			color: var(--light-d);
		}

		&:focus {
			outline: 1px solid var(--dark-a);
			&::placeholder {
				content: '';
				color: transparent;
			}
		}
	}

	.email {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 1rem;

		margin-top: auto;

		.note {
			opacity: 0.5;
		}
	}

	.button {
		margin: auto;
		width: fit-content;
	}
</style>