<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';

	let {
		items,
		item,
		columns = 3,
		rows,
	}: {
		items: T[];
		item: Snippet<[T, number]>;
		columns?: number;
		rows?: number;
	} = $props();

	const grouped = $derived(
		Array.from({ length: columns }, (_, col) =>
			items
				.map((value, index) => ({ value, index }))
				.filter(({ index }) => index % columns === col)
				.slice(0, rows)
		)
	);
</script>

<div class="masonry" style:--columns={columns}>
	{#each grouped as column, col (col)}
		<div class="masonry-col col">
			{#each column as { value, index } (index)}
				<div class="masonry-item" style:order={index}>
					{@render item(value, index)}
				</div>
			{/each}
		</div>
	{/each}
</div>

<style>
	.masonry {
		display: grid;
		grid-template-columns: repeat(var(--columns, 3), 1fr);
		gap: var(--gap, 0.5rem);
		width: 100%;
		@media (width <= 950px) {
			grid-template-columns: 1fr;
		}
	}

	.masonry-col {
		gap: var(--gap, 0.5rem);
		align-items: stretch;
		min-width: 0;
	}

	.masonry-item {
		display: flex;
		min-width: 0;
	}

	@media (width <= 950px) {
		.masonry-col {
			display: contents;
		}
	}
</style>
