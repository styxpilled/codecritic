<script lang="ts">
	type Props = {
		value?: number;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		t?: any;
		noInput?: boolean;
	};

	let { value = -1, t, noInput = false }: Props = $props();
	let elements = $state(Array(10));
	let index = $state(-1);
</script>

<div class="rating" class:prop={noInput}>
	<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
	{#each { length: 10 } as _, i (i)}
		<label class="star">
			<input
				{...!noInput ? t.as('radio', i + 1) : {}}
				type="radio"
				name="rating"
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
			<svg xmlns="http://www.w3.org/2000/svg" width="16" height="32" viewBox="0 0 32 64">
				<path d="M0 25h26l8-25 8 25h25L46 40l8 24-20-15-21 15 8-24z" />
			</svg>
		</label>
	{/each}
</div>

<style>
	.rating {
		cursor: pointer;
		display: flex;
		width: min-content;
		margin-top: -2px;
		margin-bottom: 2px;
		&.prop {
			pointer-events: none;
		}
	}

	.star {
		fill: var(--color-text-dark);
		cursor: pointer;
		& input {
			display: none;
		}
		&:nth-child(2n) {
			transform: scale(-1, 1);
			padding-right: 1px;
			margin-left: -1px;
		}
		&:has(:global(~ .star:hover)),
		:hover {
			fill: var(--color-blue);
		}
	}

	:not(.rating:hover) .star:has(:global(~ .star > input:checked)),
	:not(.rating:hover) .star > input:checked + svg {
		fill: var(--color-green);
	}
</style>
