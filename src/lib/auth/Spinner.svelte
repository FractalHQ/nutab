<script>
	export let color = 'var(--light-c)'
	export let thickness = 2
	export let speed = 750
	export let radius = 10
	export let size = 35
	export let gap = 40
	let dash
	$: dash = (2 * Math.PI * radius * (100 - gap)) / 100
</script>

<svg
	height={size}
	width={size}
	style="animation-duration:{speed}ms;"
	class="svelte-spinner"
	viewBox="0 0 32 32"
>
	<circle
		role="presentation"
		cx="16"
		cy="16"
		r={radius}
		stroke={color}
		fill="none"
		stroke-width={thickness}
		stroke-dasharray="{dash},100"
		stroke-linecap="round"
	/>
</svg>

<style>
	.svelte-spinner {
		transition-property: transform;
		animation-name: svelte-spinner_infinite-spin;
		animation-iteration-count: infinite;
		animation-timing-function: linear;
		width: max-content;
		margin: auto;
		display: flex;
	}
	@keyframes svelte-spinner_infinite-spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
</style>
