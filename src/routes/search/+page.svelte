<script lang="ts">
	import { searchNPM } from '$api/npm.remote';
	import { page } from '$app/state';
	import Package from '$ui/Package';
	// let query = page.url.searchParams.get('query');
</script>

<svelte:boundary>
	{@const query = page.url.searchParams.get('query')}
	<h3>Showing matches for "{query}":</h3>
	<ul class="">
		{#if query}
			{#await searchNPM(query || '')}
				loading
			{:then I}
				{#each I as pkg (pkg.name)}
					<li>
						<Package {pkg} />
					</li>
				{/each}
			{/await}
		{:else}
			<h3>Nothing here but chickens!</h3>
		{/if}
	</ul>
	<button class="bg-light">Load more results</button>
</svelte:boundary>

<style>
	h3 {
		text-transform: uppercase;
		margin: 2rem 0.5rem 3rem;
		font-size: 1rem;
		@media (width <=950px) {
			margin: 2rem 3rem;
		}
	}

	ul {
		/* margin: 0 auto; */
		margin: 1rem -1.5rem;
		display: grid;
		/* width: 1040px; */
		grid-template-columns: 1fr 1fr 1fr;
		gap: 1rem;
		width: min-content;

		@media (width <=950px) {
			margin: 0 auto;
			grid-template-columns: 1fr;
		}
	}
</style>
