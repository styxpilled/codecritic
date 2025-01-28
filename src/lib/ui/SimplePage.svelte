<script>
	/** @type {{children?: import('svelte').Snippet}} */
	let { children } = $props();
</script>

<div class="simple-page col">
	{@render children?.()}
</div>

<style>
	.simple-page.col {
		gap: 1.5rem;
	}

	.simple-page > :global(h2),
	.simple-page > :global(.header-start) {
		margin-top: 3rem;
	}

	.simple-page > :global(.header-end) {
		margin-bottom: 2rem;
	}
</style>
