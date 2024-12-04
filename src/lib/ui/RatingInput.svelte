<script lang="ts">
	interface Props {
		value?: any;
	}

	let { value = -1 }: Props = $props();
	let elements = $state(Array(10));
	let index = $state(-1);
</script>

<div class="rating">
	{#each { length: 10 } as _, i}
		<label class="star">
			<input
				type="radio"
				name="rating"
				value={i + 1}
				checked={value === i + 1 && index === -1}
				bind:this={elements[i]}
				onclick={() => {
					if (index === i + 1) {
						index = -1;
						elements[i].checked = false;
					} else {
						index = i + 1;
					}
				}}
			/>
			<svg viewBox="0 0 32 64" width="16" height="32" xmlns="http://www.w3.org/2000/svg">
				<path
					d="m0,24.56067l25.65797,0l7.92851,-24.37496l7.92851,24.37496l25.65796,0l-20.75769,15.06438l7.92892,24.37496l-20.7577,-15.06479l-20.7577,15.06479l7.92892,-24.37496l-20.7577,-15.06438z"
				/>
			</svg>
		</label>
	{/each}
</div>

<style>
	.rating {
		cursor: pointer;
		display: flex;
		width: min-content;
	}

	.star {
		fill: var(--color-text-dark);
		cursor: pointer;
		& input {
			display: none;
		}
	}

	.star:nth-child(2n) {
		transform: scale(-1, 1);
	}

	.star:has(:global(~ .star:hover)),
	.star:hover {
		fill: var(--color-blue);
	}

	:not(.rating:hover) .star:has(:global(~ .star > input:checked)),
	:not(.rating:hover) .star > input:checked + svg {
		fill: var(--color-green);
	}
</style>
