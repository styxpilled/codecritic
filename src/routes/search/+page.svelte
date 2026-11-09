<script lang="ts">
	import { searchNPM } from '#api/npm.remote.ts';
	import List from '#ui/List.svelte';
	import Package from '#ui/Package/index.ts';
	import { page } from '$app/state';

	let query = $derived(page.url.searchParams.get('query'));
	const results = $derived(query ? await searchNPM(query) : []);
</script>

<!-- Preloading a result would store the package in D1, so wait for a tap. -->
<svelte:boundary>
	{#if results && results.length > 0}
		<div data-sveltekit-preload-data="tap" style="display: contents">
			<List>
				{#snippet head()}
					<h3 class="fg-dark">Showing matches for "{query}":</h3>
				{/snippet}
				{#each results as pkg (pkg.name)}
					<Package {pkg} />
				{/each}
				{#snippet foot()}
					<span></span>
					<a href="/search?{page.url.searchParams}" class="hov-link">
						Load more results
					</a>
				{/snippet}
			</List>
		</div>
	{:else}
		<h3 class="fg-dark">Nothing here but chickens!</h3>
	{/if}
</svelte:boundary>
