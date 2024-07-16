<div class="simple-page col">
	<slot />
</div>

<style>
	.simple-page.col {
		gap: 2rem;
	}

	.simple-page > :global(h2),
	.simple-page > :global(.header-start) {
		margin-top: 3rem;
	}

	.simple-page > :global(.header-end) {
		margin-bottom: 2rem;
	}
</style>
